import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  radius: number;
  color: string;
  vx: number;
  vy: number;
  baseX: number;
  baseY: number;
  angle: number;
  speed: number;
}

export default function InteractiveDnaBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Track Mouse Position
    const mouse = {
      x: -1000,
      y: -1000,
      radius: 150,
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // Color Palette: Eczacıdan Orange, Amber, Cyan, Soft Glowing White
    const colors = [
      'rgba(249, 115, 22, 0.75)',  // Orange
      'rgba(245, 158, 11, 0.75)',  // Amber
      'rgba(56, 189, 248, 0.65)',  // Medical Cyan
      'rgba(251, 146, 60, 0.70)',  // Soft Coral Orange
      'rgba(255, 255, 255, 0.80)', // Bright White DNA Core
    ];

    // Create DNA / Molecule Particles
    const particleCount = Math.min(80, Math.floor((width * height) / 14000));
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const radius = Math.random() * 4.5 + 2.5; // Small glowing DNA balls
      const x = Math.random() * width;
      const y = Math.random() * height;
      particles.push({
        x,
        y,
        radius,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        baseX: x,
        baseY: y,
        angle: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.02 + 0.005,
      });
    }

    // Main Render Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw faint molecular grid lines between close particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            const alpha = (1 - dist / 110) * 0.25;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(249, 115, 22, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Update and Draw Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Wave Floating Motion (DNA Helix Sine Wave Effect)
        p.angle += p.speed;
        p.x += Math.cos(p.angle) * 0.35 + p.vx;
        p.y += Math.sin(p.angle) * 0.35 + p.vy;

        // Friction to bring velocity back down
        p.vx *= 0.95;
        p.vy *= 0.95;

        // Mouse Repulsion & Drift Logic (Sağa Sola Kayma)
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius && dist > 0) {
          const force = (mouse.radius - dist) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          // Push outward smoothly with high responsiveness
          const pushX = Math.cos(angle) * force * 5.0;
          const pushY = Math.sin(angle) * force * 5.0;

          p.vx += pushX;
          p.vy += pushY;
        }

        // Screen boundary wrapping
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        // Draw Particle Core
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-80"
    />
  );
}
