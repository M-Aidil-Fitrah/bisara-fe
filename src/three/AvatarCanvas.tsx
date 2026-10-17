import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

interface AvatarCanvasProps {
  signing?: boolean
  className?: string
  modelUrl?: string
  actionName?: string
}

export default function AvatarCanvas({
  signing = false,
  className = '',
  modelUrl = '/models/avatar.glb',
  actionName,
}: AvatarCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [hasGLB, setHasGLB] = useState<boolean | null>(null)

  const signingRef = useRef(signing)
  signingRef.current = signing
  const actionNameRef = useRef(actionName)
  actionNameRef.current = actionName

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const width = mount.clientWidth || 300
    const height = mount.clientHeight || 300

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100)
    camera.position.set(0, 1.35, 2.3)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.1
    mount.appendChild(renderer.domElement)

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4)
    scene.add(ambientLight)

    const dirLight = new THREE.DirectionalLight(0xfff5ea, 2.2)
    dirLight.position.set(2, 4, 3)
    scene.add(dirLight)

    const fillLight = new THREE.DirectionalLight(0x90b5df, 1.2)
    fillLight.position.set(-2, 2, 2)
    scene.add(fillLight)

    const backLight = new THREE.DirectionalLight(0x22568a, 1.6)
    backLight.position.set(0, 3, -2)
    scene.add(backLight)

    let mixer: THREE.AnimationMixer | null = null
    let idleAction: THREE.AnimationAction | null = null
    let signAction: THREE.AnimationAction | null = null
    let currentAction: THREE.AnimationAction | null = null
    let proceduralGroup: THREE.Group | null = null
    let leftArmGroup: THREE.Group | null = null
    let rightArmGroup: THREE.Group | null = null
    let headMesh: THREE.Mesh | null = null

    // Procedural Fallback Mannequin
    const setupProcedural = () => {
      const group = new THREE.Group()
      scene.add(group)
      proceduralGroup = group

      const bodyGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.7, 32)
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0x22568a, roughness: 0.4 })
      const body = new THREE.Mesh(bodyGeo, bodyMat)
      body.position.y = 0.95
      group.add(body)

      const skinMat = new THREE.MeshStandardMaterial({ color: 0xf3d6c0, roughness: 0.5 })
      const headGeo = new THREE.SphereGeometry(0.18, 32, 32)
      headMesh = new THREE.Mesh(headGeo, skinMat)
      headMesh.position.y = 1.46
      group.add(headMesh)

      const hairGeo = new THREE.SphereGeometry(0.19, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5)
      const hairMat = new THREE.MeshStandardMaterial({ color: 0x10263b, roughness: 0.6 })
      const hair = new THREE.Mesh(hairGeo, hairMat)
      hair.position.y = 1.48
      group.add(hair)

      leftArmGroup = new THREE.Group()
      leftArmGroup.position.set(-0.32, 1.2, 0)
      const armGeo = new THREE.CylinderGeometry(0.06, 0.05, 0.4, 16)
      const armMat = new THREE.MeshStandardMaterial({ color: 0x22568a, roughness: 0.4 })
      const leftArm = new THREE.Mesh(armGeo, armMat)
      leftArm.position.y = -0.2
      leftArmGroup.add(leftArm)
      const handGeo = new THREE.SphereGeometry(0.06, 16, 16)
      const leftHand = new THREE.Mesh(handGeo, skinMat)
      leftHand.position.y = -0.42
      leftArmGroup.add(leftHand)
      group.add(leftArmGroup)

      rightArmGroup = new THREE.Group()
      rightArmGroup.position.set(0.32, 1.2, 0)
      const rightArm = new THREE.Mesh(armGeo, armMat)
      rightArm.position.y = -0.2
      rightArmGroup.add(rightArm)
      const rightHand = new THREE.Mesh(handGeo, skinMat)
      rightHand.position.y = -0.42
      rightArmGroup.add(rightHand)
      group.add(rightArmGroup)
    }

    // Try to load GLB model
    const loader = new GLTFLoader()
    loader.load(
      modelUrl,
      (gltf) => {
        const model = gltf.scene
        scene.add(model)
        setHasGLB(true)
        setLoading(false)

        // Center and normalize model bounds
        const box = new THREE.Box3().setFromObject(model)
        const size = box.getSize(new THREE.Vector3())
        const center = box.getCenter(new THREE.Vector3())

        // Reconstruct exact Blender styling: dark shoes, denim pants, teal shirt, hands/forearms skin, warm skin head/neck, espresso hair
        model.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material) {
            const mats = Array.isArray(child.material) ? child.material : [child.material]
            mats.forEach((mat) => {
              if (mat instanceof THREE.MeshStandardMaterial) {
                if (mat.name.includes('Outfit')) {
                  const geo = child.geometry
                  const posAttr = geo.attributes.position
                  const skinIndices = geo.attributes.skinIndex
                  const skinWeights = geo.attributes.skinWeight

                  if (posAttr) {
                    const count = posAttr.count
                    const colors = new Float32Array(count * 3)

                    const shoesCol = new THREE.Color('#222426')
                    const pantsCol = new THREE.Color('#3b5773')
                    const shirtCol = new THREE.Color('#5ea6a0')
                    const skinCol = new THREE.Color('#deb89b')

                    // Hand and forearm bones (forearm, hand, fingers L & R)
                    const handJoints = new Set([
                      7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
                      25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40
                    ])

                    for (let i = 0; i < count; i++) {
                      const y = posAttr.getY(i)
                      let handWeight = 0

                      if (skinIndices && skinWeights) {
                        for (let s = 0; s < 4; s++) {
                          const joint = skinIndices.getComponent(i, s)
                          const weight = skinWeights.getComponent(i, s)
                          if (handJoints.has(joint)) handWeight += weight
                        }
                      }

                      let chosenCol = shirtCol
                      if (handWeight > 0.35) {
                        chosenCol = skinCol
                      } else if (y < 0.25) {
                        chosenCol = shoesCol
                      } else if (y < 1.72) {
                        chosenCol = pantsCol
                      } else if (y < 3.40) {
                        chosenCol = shirtCol
                      } else {
                        chosenCol = skinCol
                      }

                      colors[i * 3] = chosenCol.r
                      colors[i * 3 + 1] = chosenCol.g
                      colors[i * 3 + 2] = chosenCol.b
                    }

                    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
                    mat.vertexColors = true
                    mat.color.setHex(0xffffff)
                    mat.roughness = 0.55
                    mat.needsUpdate = true
                  }
                } else if (mat.name.includes('Skin')) {
                  mat.color.set(new THREE.Color('#deb89b'))
                  mat.roughness = 0.5
                  mat.needsUpdate = true
                } else if (mat.name.includes('Hair')) {
                  mat.color.set(new THREE.Color('#38241b'))
                  mat.roughness = 0.6
                  mat.needsUpdate = true
                }
              }
            })
          }
        })

        // Target avatar height ~ 1.8 units
        const scale = size.y > 0 ? 1.8 / size.y : 1
        model.scale.setScalar(scale)

        // Center avatar
        model.position.x = -center.x * scale
        model.position.y = -box.min.y * scale
        model.position.z = -center.z * scale

        // Frame upper body (chest, shoulders, face) perfectly matching Blender view
        camera.position.set(0, 1.25, 1.55)
        camera.lookAt(0, 1.18, 0)

        // Setup Animations
        if (gltf.animations && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(model)

          // Find animations
          const clips = gltf.animations
          const idleClip =
            clips.find((c) => /idle/i.test(c.name)) ||
            clips.find((c) => /ready/i.test(c.name)) ||
            clips[0]
          const signClip =
            (actionNameRef.current && clips.find((c) => c.name.toLowerCase() === actionNameRef.current?.toLowerCase())) ||
            clips.find((c) => /terima/i.test(c.name)) ||
            clips.find((c) => /air/i.test(c.name)) ||
            clips[1] ||
            clips[0]

          if (idleClip) idleAction = mixer.clipAction(idleClip)
          if (signClip) signAction = mixer.clipAction(signClip)

          // Start initial action
          if (signingRef.current && signAction) {
            signAction.play()
            currentAction = signAction
          } else if (idleAction) {
            idleAction.play()
            currentAction = idleAction
          }
        }
      },
      undefined,
      (err) => {
        console.warn('Failed to load GLB, using procedural 3D mannequin:', err)
        setHasGLB(false)
        setLoading(false)
        setupProcedural()
      },
    )

    let reqId: number
    const clock = new THREE.Clock()

    const animate = () => {
      reqId = requestAnimationFrame(animate)
      const delta = clock.getDelta()
      const t = clock.getElapsedTime()

      // GLB Mixer update
      if (mixer) {
        mixer.update(delta)

        // Check if action needs to switch
        const isSigning = signingRef.current
        const targetAction = isSigning ? signAction : idleAction

        if (targetAction && currentAction !== targetAction) {
          if (currentAction) {
            currentAction.fadeOut(0.25)
          }
          targetAction.reset().fadeIn(0.25).play()
          currentAction = targetAction
        }
      }

      // Procedural Mannequin animation fallback
      if (proceduralGroup && leftArmGroup && rightArmGroup && headMesh) {
        if (signingRef.current) {
          leftArmGroup.rotation.x = Math.sin(t * 4) * 0.4 - 0.4
          leftArmGroup.rotation.z = Math.cos(t * 3.5) * 0.3 - 0.3
          rightArmGroup.rotation.x = Math.cos(t * 4) * 0.4 - 0.4
          rightArmGroup.rotation.z = -Math.sin(t * 3.5) * 0.3 + 0.3
          headMesh.rotation.y = Math.sin(t * 2) * 0.08
        } else {
          leftArmGroup.rotation.x = 0
          leftArmGroup.rotation.z = 0
          rightArmGroup.rotation.x = 0
          rightArmGroup.rotation.z = 0
          headMesh.rotation.y = 0
        }
      }

      renderer.render(scene, camera)
    }
    animate()

    const handleResize = () => {
      if (!mount) return
      const w = mount.clientWidth
      const h = mount.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(reqId)
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [modelUrl])

  return (
    <div className={`relative size-full min-h-[240px] ${className}`}>
      <div ref={mountRef} className="size-full" />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-paper/40 backdrop-blur-xs">
          <div className="flex items-center gap-2 rounded-full bg-surface/90 px-3 py-1.5 text-xs text-muted shadow-sm">
            <span className="size-2 animate-ping rounded-full bg-brand" /> Memuat Avatar 3D…
          </div>
        </div>
      )}
      {hasGLB && (
        <span className="absolute bottom-2 right-2 rounded bg-ink/70 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-paper/90 backdrop-blur-xs">
          WebGL 3D · BISINDO
        </span>
      )}
    </div>
  )
}
