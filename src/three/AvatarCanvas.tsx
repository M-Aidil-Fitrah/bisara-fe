import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { findActiveMotionRange } from '../lib/animationTiming'
import type { AnimationClipTiming } from '../lib/signSequence'

interface AvatarCanvasProps {
  signing?: boolean
  className?: string
  modelUrl: string
  actionName: string
  onAnimationsLoaded?: ((clips: AnimationClipTiming[]) => void) | undefined
  framing?: 'upper-body' | 'thigh-up'
  animationStartOffsetMs?: number
  animationEndOffsetMs?: number | undefined
  actionKey?: string
}

const SIGN_TRACK_PATTERN = /(hand|forearm|upper_arm|shoulder|index|middle|ring|pinky|thumb)/i

function measureMotionRange(clip: THREE.AnimationClip): AnimationClipTiming {
  const tracks = clip.tracks.filter((track) => SIGN_TRACK_PATTERN.test(track.name))
  const selectedTracks = tracks.length > 0 ? tracks : clip.tracks
  const motionByTime = new Map<number, number>()

  for (const track of selectedTracks) {
    const valueSize = track.getValueSize()
    for (let frame = 1; frame < track.times.length; frame += 1) {
      let difference = 0
      for (let offset = 0; offset < valueSize; offset += 1) {
        const current = track.values[frame * valueSize + offset] ?? 0
        const previous = track.values[(frame - 1) * valueSize + offset] ?? 0
        difference += Math.abs(current - previous)
      }
      const timeMs = Math.round((track.times[frame] ?? clip.duration) * 1_000)
      motionByTime.set(timeMs, (motionByTime.get(timeMs) ?? 0) + difference)
    }
  }

  const durationMs = clip.duration * 1_000
  const motionRange = findActiveMotionRange(
    [...motionByTime.entries()]
      .sort(([left], [right]) => left - right)
      .map(([timeMs, motion]) => ({ timeMs, motion })),
    durationMs,
  )
  return {
    name: clip.name,
    durationMs,
    ...motionRange,
  }
}

export default function AvatarCanvas({
  signing = false,
  className = '',
  modelUrl,
  actionName,
  onAnimationsLoaded,
  framing = 'upper-body',
  animationStartOffsetMs = 0,
  animationEndOffsetMs,
  actionKey = '',
}: AvatarCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [hasGLB, setHasGLB] = useState<boolean | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  const signingRef = useRef(signing)
  const actionNameRef = useRef(actionName)
  const actionKeyRef = useRef(actionKey)
  const animationStartOffsetRef = useRef(animationStartOffsetMs)
  const animationEndOffsetRef = useRef(animationEndOffsetMs)

  useEffect(() => {
    signingRef.current = signing
    actionNameRef.current = actionName
    actionKeyRef.current = actionKey
    animationStartOffsetRef.current = animationStartOffsetMs
    animationEndOffsetRef.current = animationEndOffsetMs
  }, [signing, actionName, actionKey, animationStartOffsetMs, animationEndOffsetMs])

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
      let clips: THREE.AnimationClip[] = []
      let selectedActionName: string | undefined
      let selectedActionKey = actionKeyRef.current
    // Try to load GLB model
    const loader = new GLTFLoader()
    let disposed = false
    loader.load(
      modelUrl,
      (gltf) => {
        if (disposed) return
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

                      let chosenCol: THREE.Color
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
        if (framing === 'thigh-up') {
          camera.position.set(0, 1.05, 2.15)
          camera.lookAt(0, 1.05, 0)
        } else {
          camera.position.set(0, 1.25, 1.55)
          camera.lookAt(0, 1.18, 0)
        }

        // Setup Animations
        if (gltf.animations && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(model)

          // Find animations
          clips = gltf.animations
          onAnimationsLoaded?.(clips.map(measureMotionRange))
          const idleClip =
            clips.find((c) => /idle/i.test(c.name)) ||
            clips.find((c) => /ready/i.test(c.name)) ||
            null
          selectedActionName = actionNameRef.current
          const signClip = selectedActionName
            ? clips.find((clip) => clip.name.toLowerCase() === selectedActionName?.toLowerCase())
            : undefined
          if (selectedActionName && !signClip) {
            setLoadError(`Animasi “${selectedActionName}” tidak ditemukan dalam aset`)
          }

          if (idleClip) idleAction = mixer.clipAction(idleClip)
          if (signClip) signAction = mixer.clipAction(signClip)
          idleAction?.setLoop(THREE.LoopRepeat, Number.POSITIVE_INFINITY)

          // Start initial action
          if (signingRef.current && signAction) {
            signAction.setLoop(THREE.LoopOnce, 1)
            signAction.clampWhenFinished = true
            signAction.reset()
            signAction.time = Math.min(animationStartOffsetRef.current / 1_000, Math.max(signAction.getClip().duration - 0.05, 0))
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
        console.warn('Failed to load GLB animation asset:', err)
        setHasGLB(false)
        setLoading(false)
        setLoadError('Aset animasi tidak dapat dimuat')
      },
    )

    let reqId = 0
    const clock = new THREE.Clock()
    let isIntersecting = true

    const animate = () => {
      if (disposed || document.hidden || !isIntersecting) {
        reqId = 0
        return
      }
      reqId = requestAnimationFrame(animate)
      const delta = clock.getDelta()
      // GLB Mixer update
      if (mixer) {
        mixer.update(delta)

        if (selectedActionName !== actionNameRef.current || selectedActionKey !== actionKeyRef.current) {
          selectedActionName = actionNameRef.current
          selectedActionKey = actionKeyRef.current
          const requestedClip = selectedActionName
            ? clips.find((clip) => clip.name.toLowerCase() === selectedActionName?.toLowerCase())
            : undefined
          currentAction?.fadeOut(0.25)
          signAction = requestedClip ? mixer.clipAction(requestedClip) : null
          currentAction = null
          setLoadError(selectedActionName && !requestedClip ? `Animasi “${selectedActionName}” tidak ditemukan dalam aset` : null)
        }

        // Check if action needs to switch
        const isSigning = signingRef.current
        const targetAction = isSigning ? signAction : idleAction

        if (targetAction && currentAction !== targetAction) {
          if (currentAction) {
            currentAction.fadeOut(0.25)
          }
          targetAction.reset()
          targetAction.paused = false
          if (targetAction === signAction) {
            targetAction.setLoop(THREE.LoopOnce, 1)
            targetAction.clampWhenFinished = true
            targetAction.time = Math.min(animationStartOffsetRef.current / 1_000, Math.max(targetAction.getClip().duration - 0.05, 0))
          }
          targetAction.fadeIn(0.25).play()
          currentAction = targetAction
        }

        const activeAction = currentAction
        if (activeAction && activeAction === signAction && animationEndOffsetRef.current !== undefined) {
          const endTime = Math.min(animationEndOffsetRef.current / 1_000, activeAction.getClip().duration)
          if (activeAction.time >= endTime) {
            activeAction.time = endTime
            activeAction.paused = true
          }
        }
      }

      renderer.render(scene, camera)
    }
    animate()

    const resumeAnimation = () => {
      if (!reqId && !document.hidden && isIntersecting && !disposed) {
        clock.start()
        animate()
      }
    }

    const handleVisibility = () => {
      if (document.hidden && reqId) {
        cancelAnimationFrame(reqId)
        reqId = 0
      } else {
        resumeAnimation()
      }
    }

    const observer = new IntersectionObserver(([entry]) => {
      isIntersecting = entry?.isIntersecting ?? false
      if (!isIntersecting && reqId) {
        cancelAnimationFrame(reqId)
        reqId = 0
      } else {
        resumeAnimation()
      }
    })
    observer.observe(mount)

    const handleResize = () => {
      if (!mount) return
      const w = mount.clientWidth
      const h = mount.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }

    window.addEventListener('resize', handleResize)
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      disposed = true
      cancelAnimationFrame(reqId)
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('visibilitychange', handleVisibility)
      observer.disconnect()
      renderer.dispose()
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return
        object.geometry.dispose()
        const materials = Array.isArray(object.material) ? object.material : [object.material]
        materials.forEach((material) => material.dispose())
      })
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [framing, modelUrl, onAnimationsLoaded])

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
      {loadError && (
        <div role="alert" className="absolute inset-0 grid place-items-center bg-ink/90 px-6 text-center text-sm text-paper">
          {loadError}
        </div>
      )}
    </div>
  )
}
