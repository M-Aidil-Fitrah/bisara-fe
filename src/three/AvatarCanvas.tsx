import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface AvatarCanvasProps {
  signing?: boolean
  className?: string
  modelUrl?: string
}

export default function AvatarCanvas({ signing = false, className = '' }: AvatarCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 100)
    camera.position.set(0, 1.4, 2.5)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    mount.appendChild(renderer.domElement)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2)
    scene.add(ambientLight)

    const dirLight = new THREE.DirectionalLight(0xa9c5e0, 2)
    dirLight.position.set(2, 4, 3)
    scene.add(dirLight)

    const backLight = new THREE.DirectionalLight(0x22568a, 1.5)
    backLight.position.set(-2, 2, -2)
    scene.add(backLight)

    // Stylized procedural 3D mannequin representing BISARA Avatar
    const group = new THREE.Group()
    scene.add(group)

    // Torso
    const bodyGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.7, 32)
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x22568a, roughness: 0.4 })
    const body = new THREE.Mesh(bodyGeo, bodyMat)
    body.position.y = 0.95
    group.add(body)

    // Head
    const headGeo = new THREE.SphereGeometry(0.18, 32, 32)
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xf3d6c0, roughness: 0.5 })
    const head = new THREE.Mesh(headGeo, skinMat)
    head.position.y = 1.46
    group.add(head)

    // Hair
    const hairGeo = new THREE.SphereGeometry(0.19, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5)
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x10263b, roughness: 0.6 })
    const hair = new THREE.Mesh(hairGeo, hairMat)
    hair.position.y = 1.48
    group.add(hair)

    // Left Arm & Hand
    const leftArmGroup = new THREE.Group()
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

    // Right Arm & Hand
    const rightArmGroup = new THREE.Group()
    rightArmGroup.position.set(0.32, 1.2, 0)
    const rightArm = new THREE.Mesh(armGeo, armMat)
    rightArm.position.y = -0.2
    rightArmGroup.add(rightArm)

    const rightHand = new THREE.Mesh(handGeo, skinMat)
    rightHand.position.y = -0.42
    rightArmGroup.add(rightHand)
    group.add(rightArmGroup)

    let reqId: number
    let clock = new THREE.Clock()

    const animate = () => {
      reqId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()

      if (signing) {
        leftArmGroup.rotation.x = Math.sin(t * 4) * 0.4 - 0.4
        leftArmGroup.rotation.z = Math.cos(t * 3.5) * 0.3 - 0.3
        rightArmGroup.rotation.x = Math.cos(t * 4) * 0.4 - 0.4
        rightArmGroup.rotation.z = -Math.sin(t * 3.5) * 0.3 + 0.3
        head.rotation.y = Math.sin(t * 2) * 0.08
      } else {
        leftArmGroup.rotation.x = 0
        leftArmGroup.rotation.z = 0
        rightArmGroup.rotation.x = 0
        rightArmGroup.rotation.z = 0
        head.rotation.y = 0
      }

      renderer.render(scene, camera)
    }
    animate()

    const handleResize = () => {
      if (!mount) return
      camera.aspect = mount.clientWidth / mount.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mount.clientWidth, mount.clientHeight)
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
  }, [signing])

  return <div ref={mountRef} className={`relative size-full min-h-[220px] ${className}`} />
}
