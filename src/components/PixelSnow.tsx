import { useEffect, useRef } from 'react';

interface PixelSnowProps {
  color?: string;
  flakeSize?: number;
  minFlakeSize?: number;
  pixelResolution?: number;
  speed?: number;
  density?: number;
  direction?: number;
  brightness?: number;
}

export default function PixelSnow({
  color = '#FFD700', // Default to gold to match theme
  flakeSize = 0.01,
  minFlakeSize = 1.25,
  pixelResolution = 200,
  speed = 1.25,
  density = 0.3,
  direction = 125,
  brightness = 1,
}: PixelSnowProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx || !canvas) return;

    // Set canvas size
    const resizeCanvas = () => {
      if (!canvas) return;
      const container = canvas.parentElement;
      if (container && canvas) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Parse color to RGB
    const hexToRgb = (hex: string): [number, number, number] => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16),
          ]
        : [255, 215, 0]; // Default gold
    };

    const [r, g, b] = hexToRgb(color);
    const rgbaColor = `rgba(${r}, ${g}, ${b}, ${brightness})`;

    // Snowflake class
    class Snowflake {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      canvasWidth: number;
      canvasHeight: number;

      constructor(canvasWidth: number, canvasHeight: number) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.size = minFlakeSize + Math.random() * (flakeSize * pixelResolution);
        const angle = (direction * Math.PI) / 180;
        const baseSpeed = speed * (0.5 + Math.random() * 0.5);
        this.speedX = Math.cos(angle) * baseSpeed;
        this.speedY = Math.sin(angle) * baseSpeed;
        this.opacity = 0.3 + Math.random() * 0.7;
      }

      update(canvasWidth: number, canvasHeight: number) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap around edges
        if (this.x < 0) this.x = canvasWidth;
        if (this.x > canvasWidth) this.x = 0;
        if (this.y < 0) this.y = canvasHeight;
        if (this.y > canvasHeight) this.y = 0;
      }

      draw(ctx: CanvasRenderingContext2D, rgbaColor: string) {
        ctx.fillStyle = rgbaColor.replace(')', `, ${this.opacity})`);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Create snowflakes
    const snowflakeCount = Math.floor((canvas.width * canvas.height * density) / 10000);
    const snowflakes: Snowflake[] = [];
    for (let i = 0; i < snowflakeCount; i++) {
      snowflakes.push(new Snowflake(canvas.width, canvas.height));
    }

    // Animation loop
    let animationId: number;
    const animate = () => {
      if (!canvas || !ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      snowflakes.forEach((flake) => {
        flake.update(canvas.width, canvas.height);
        flake.draw(ctx, rgbaColor);
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [color, flakeSize, minFlakeSize, pixelResolution, speed, density, direction, brightness]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    />
  );
}

