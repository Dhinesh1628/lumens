import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function HeroScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 6.5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Group to hold wireframe and points
    const group = new THREE.Group();
    scene.add(group);

    // 1. Wireframe Icosahedron (radius 2.1, detail 1)
    const icoGeometry = new THREE.IcosahedronGeometry(2.1, 1);
    const wireframeGeometry = new THREE.WireframeGeometry(icoGeometry);
    const wireframeMaterial = new THREE.LineBasicMaterial({
      color: 0x5b6cf0,
      transparent: true,
      opacity: 0.35
    });
    const wireframeMesh = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
    group.add(wireframeMesh);

    // 2. Surrounding Vector Point Cloud (~140 points in spherical shell)
    const count = 140;
    const positions = new Float32Array(count * 3);
    const radiusMin = 2.4;
    const radiusMax = 3.6;

    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = radiusMin + Math.random() * (radiusMax - radiusMin);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }

    const pointsGeometry = new THREE.BufferGeometry();
    pointsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const pointsMaterial = new THREE.PointsMaterial({
      color: 0x5b6cf0,
      size: 0.05,
      transparent: true,
      opacity: 0.6
    });
    const pointsMesh = new THREE.Points(pointsGeometry, pointsMaterial);
    group.add(pointsMesh);

    // Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!prefersReducedMotion) {
        const delta = clock.getDelta();
        group.rotation.y += delta * 0.15; // ~0.15 rad/sec
        group.rotation.x = Math.sin(clock.getElapsedTime() * 0.5) * 0.1; // Subtle X wobble
      }

      renderer.render(scene, camera);
    };

    animate();

    // Window Resize Handler
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);

      icoGeometry.dispose();
      wireframeGeometry.dispose();
      wireframeMaterial.dispose();
      pointsGeometry.dispose();
      pointsMaterial.dispose();
      renderer.dispose();

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full pointer-events-none hidden md:block opacity-75 overflow-hidden z-0"
      aria-hidden="true"
    />
  );
}
