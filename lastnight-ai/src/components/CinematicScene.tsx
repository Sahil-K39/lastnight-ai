import { useEffect, useRef } from "react";
import * as THREE from "three";

interface CinematicSceneProps {
  density?: "calm" | "active";
}

export default function CinematicScene({ density = "active" }: CinematicSceneProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05070d, 0.038);

    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 120);
    camera.position.set(0, 2.4, 12);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x05070d, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const root = new THREE.Group();
    scene.add(root);

    const grid = new THREE.GridHelper(42, 42, 0x4cd7f6, 0x25324a);
    grid.position.set(0, -2.8, -8);
    const gridMaterial = grid.material as THREE.Material;
    gridMaterial.transparent = true;
    gridMaterial.opacity = 0.28;
    root.add(grid);

    const scanRing = new THREE.Mesh(
      new THREE.TorusGeometry(3.7, 0.018, 8, 160),
      new THREE.MeshBasicMaterial({ color: 0x4cd7f6, transparent: true, opacity: 0.72 })
    );
    scanRing.position.set(0, 0.1, -4.6);
    scanRing.rotation.x = 1.2;
    root.add(scanRing);

    const innerRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.75, 0.012, 8, 120),
      new THREE.MeshBasicMaterial({ color: 0xffc857, transparent: true, opacity: 0.56 })
    );
    innerRing.position.set(0, 0.05, -4.2);
    innerRing.rotation.x = 1.2;
    root.add(innerRing);

    const panelMaterial = new THREE.MeshBasicMaterial({
      color: 0x92f7ff,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const accentMaterial = new THREE.MeshBasicMaterial({
      color: 0xff5f7e,
      transparent: true,
      opacity: 0.16,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const panels: THREE.Mesh[] = [];
    const panelCount = density === "active" ? 18 : 10;
    for (let i = 0; i < panelCount; i += 1) {
      const panel = new THREE.Mesh(
        new THREE.PlaneGeometry(0.9 + (i % 3) * 0.45, 0.32 + (i % 2) * 0.18),
        i % 5 === 0 ? accentMaterial : panelMaterial
      );
      const side = i % 2 === 0 ? -1 : 1;
      panel.position.set(side * (3.7 + (i % 4) * 0.78), -0.7 + (i % 6) * 0.52, -7 - (i % 5) * 1.5);
      panel.rotation.y = side * -0.58;
      panel.rotation.z = side * 0.04;
      panels.push(panel);
      root.add(panel);
    }

    const laneGeometry = new THREE.BufferGeometry();
    const lanePositions: number[] = [];
    const laneCount = density === "active" ? 34 : 22;
    for (let i = 0; i < laneCount; i += 1) {
      const x = -9 + (18 / laneCount) * i;
      lanePositions.push(x, -2.72, -1.5, x * 0.35, -2.72, -29);
    }
    laneGeometry.setAttribute("position", new THREE.Float32BufferAttribute(lanePositions, 3));
    const lanes = new THREE.LineSegments(
      laneGeometry,
      new THREE.LineBasicMaterial({ color: 0x5eead4, transparent: true, opacity: 0.18 })
    );
    root.add(lanes);

    const sparkCount = density === "active" ? 170 : 95;
    const sparkGeometry = new THREE.BufferGeometry();
    const sparkPositions: number[] = [];
    const sparkColors: number[] = [];
    const palette = [new THREE.Color(0x4cd7f6), new THREE.Color(0xd0bcff), new THREE.Color(0xffc857), new THREE.Color(0xff5f7e)];
    for (let i = 0; i < sparkCount; i += 1) {
      sparkPositions.push(
        THREE.MathUtils.randFloatSpread(18),
        THREE.MathUtils.randFloat(-2, 6),
        THREE.MathUtils.randFloat(-28, -3)
      );
      const color = palette[i % palette.length];
      sparkColors.push(color.r, color.g, color.b);
    }
    sparkGeometry.setAttribute("position", new THREE.Float32BufferAttribute(sparkPositions, 3));
    sparkGeometry.setAttribute("color", new THREE.Float32BufferAttribute(sparkColors, 3));
    const sparks = new THREE.Points(
      sparkGeometry,
      new THREE.PointsMaterial({
        size: 0.035,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
      })
    );
    root.add(sparks);

    const resize = () => {
      const width = mount.clientWidth || window.innerWidth;
      const height = mount.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      renderer.setSize(width, height, false);
    };

    let pointerX = 0;
    let pointerY = 0;
    const handlePointerMove = (event: PointerEvent) => {
      pointerX = (event.clientX / window.innerWidth - 0.5) * 2;
      pointerY = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", handlePointerMove);

    let animationId = 0;
    const clock = new THREE.Clock();
    const animate = () => {
      const elapsed = clock.getElapsedTime();
      root.rotation.y = THREE.MathUtils.lerp(root.rotation.y, pointerX * 0.055, 0.025);
      root.rotation.x = THREE.MathUtils.lerp(root.rotation.x, -pointerY * 0.026, 0.025);
      scanRing.rotation.z = elapsed * 0.18;
      innerRing.rotation.z = -elapsed * 0.28;
      grid.position.z = -8 + (elapsed * 0.9) % 1;
      lanes.position.z = (elapsed * 1.35) % 1.5;
      sparks.rotation.y = elapsed * 0.012;

      panels.forEach((panel, index) => {
        panel.position.y += Math.sin(elapsed * 0.7 + index) * 0.0009;
        panel.material.opacity = (index % 5 === 0 ? 0.12 : 0.15) + Math.sin(elapsed * 1.3 + index) * 0.035;
      });

      renderer.render(scene, camera);
      animationId = window.requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
      mount.removeChild(renderer.domElement);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Points || object instanceof THREE.LineSegments) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      renderer.dispose();
    };
  }, [density]);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="cinematic-scene fixed inset-0 z-0 pointer-events-none overflow-hidden"
    />
  );
}
