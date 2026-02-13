import { useEffect, useRef } from 'react';

export default function MouseTrail() {
  const containerRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef(null);
  const lastParticleTimeRef = useRef(0);

  useEffect(() => {
    const PARTICLE_SPAWN_INTERVAL = 8; // ms between particles (non-blocking)
    const MAX_PARTICLES = 30; // Performance: limit active particles
    const PARTICLE_LIFETIME = 800; // ms

    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      
      const now = Date.now();
      // Only spawn new particles at controlled interval
      if (now - lastParticleTimeRef.current > PARTICLE_SPAWN_INTERVAL) {
        lastParticleTimeRef.current = now;

        if (particlesRef.current.length < MAX_PARTICLES) {
          const particle = {
            id: now + Math.random(),
            x: e.clientX,
            y: e.clientY,
            createdAt: now,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
          };
          particlesRef.current.push(particle);
        }
      }
    };

    const animate = () => {
      const now = Date.now();

      // Update particles
      particlesRef.current = particlesRef.current
        .filter(p => now - p.createdAt < PARTICLE_LIFETIME)
        .map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.1, // gravity
        }));

      // Render particles
      if (containerRef.current) {
        containerRef.current.innerHTML = particlesRef.current
          .map(p => {
            const progress = (now - p.createdAt) / PARTICLE_LIFETIME;
            const opacity = Math.max(0, 1 - progress);
            const size = 4 + progress * 2;

            return `
              <div
                key="${p.id}"
                style="
                  position: fixed;
                  left: ${p.x}px;
                  top: ${p.y}px;
                  width: ${size}px;
                  height: ${size}px;
                  background: radial-gradient(circle, #60a5fa 0%, #3b82f6 70%, transparent 100%);
                  border-radius: 50%;
                  pointer-events: none;
                  opacity: ${opacity};
                  box-shadow: 0 0 ${8 + progress * 4}px rgba(59, 130, 246, ${0.6 * opacity});
                  transform: translate(-50%, -50%);
                  z-index: 40;
                  will-change: transform, opacity;
                "
              />
            `;
          })
          .join('');
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 40,
      }}
    />
  );
}