import { useEffect, useRef } from "react";
import { MarketingPage } from "../types";

interface ShootingStarBackdropProps {
  page: MarketingPage;
}

type Star = {
  x: number;
  y: number;
  size: number;
  alpha: number;
  twinkle: number;
};

type Meteor = {
  x: number;
  y: number;
  length: number;
  speed: number;
  age: number;
  delay: number;
  hue: number;
};

const pageIntensity: Record<MarketingPage, number> = {
  product: 1,
  features: 1.2,
  pricing: 0.9,
  enterprise: 1.35,
};

export default function ShootingStarBackdrop({ page }: ShootingStarBackdropProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const intensity = pageIntensity[page];
    let width = 0;
    let height = 0;
    let animationId = 0;
    let stars: Star[] = [];
    let meteors: Meteor[] = [];

    const makeMeteor = (delay = Math.random() * 260): Meteor => ({
      x: Math.random() * width * 0.95 + width * 0.05,
      y: Math.random() * height * 0.42 - height * 0.12,
      length: 120 + Math.random() * 220 * intensity,
      speed: 4.2 + Math.random() * 3.8 * intensity,
      age: 0,
      delay,
      hue: Math.random() > 0.55 ? 195 : 258,
    });

    const makeHeroMeteor = (index: number): Meteor => ({
      x: width * (0.72 + index * 0.24),
      y: height * (0.12 + index * 0.12),
      length: 340 + index * 90,
      speed: 2.2 + index * 0.45,
      age: 0,
      delay: index * 28,
      hue: index % 2 === 0 ? 195 : 258,
    });

    const resize = () => {
      width = canvas.clientWidth || window.innerWidth;
      height = canvas.clientHeight || window.innerHeight;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.75);
      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      const starCount = Math.floor((width * height) / 9800);
      stars = Array.from({ length: starCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height * 0.72,
        size: 0.55 + Math.random() * 1.35,
        alpha: 0.16 + Math.random() * 0.42,
        twinkle: Math.random() * Math.PI * 2,
      }));

      const meteorCount = Math.max(4, Math.floor(5 * intensity));
      meteors = Array.from({ length: meteorCount }, (_, index) => makeMeteor(index * 68 + Math.random() * 90));
      meteors[0] = makeHeroMeteor(0);
      meteors[1] = makeHeroMeteor(1);
    };

    const drawFrame = () => {
      context.clearRect(0, 0, width, height);
      const time = performance.now() * 0.001;

      const horizon = context.createLinearGradient(0, 0, width, height);
      horizon.addColorStop(0, "rgba(76, 215, 246, 0.05)");
      horizon.addColorStop(0.45, "rgba(160, 120, 255, 0.035)");
      horizon.addColorStop(1, "rgba(5, 7, 13, 0)");
      context.fillStyle = horizon;
      context.fillRect(0, 0, width, height);

      stars.forEach((star) => {
        const alpha = star.alpha + Math.sin(time * 0.9 + star.twinkle) * 0.1;
        context.beginPath();
        context.fillStyle = `rgba(220, 235, 255, ${Math.max(0.08, alpha)})`;
        context.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        context.fill();
      });

      meteors.forEach((meteor, index) => {
        if (meteor.delay > 0) {
          meteor.delay -= 1;
          return;
        }

        meteor.age += 1;
        meteor.x -= meteor.speed;
        meteor.y += meteor.speed * 0.34;

        const tailX = meteor.x + meteor.length;
        const tailY = meteor.y - meteor.length * 0.34;
        const opacity = Math.max(0, 1 - meteor.age / 132);
        const gradient = context.createLinearGradient(meteor.x, meteor.y, tailX, tailY);
        gradient.addColorStop(0, `hsla(${meteor.hue}, 100%, 82%, ${0.96 * opacity})`);
        gradient.addColorStop(0.18, `hsla(${meteor.hue}, 100%, 72%, ${0.55 * opacity})`);
        gradient.addColorStop(0.46, `hsla(${meteor.hue}, 100%, 66%, ${0.24 * opacity})`);
        gradient.addColorStop(1, `hsla(${meteor.hue}, 100%, 58%, 0)`);

        context.strokeStyle = gradient;
        context.lineWidth = 1.8 + intensity * 0.8;
        context.lineCap = "round";
        context.beginPath();
        context.moveTo(meteor.x, meteor.y);
        context.lineTo(tailX, tailY);
        context.stroke();

        context.beginPath();
        context.fillStyle = `hsla(${meteor.hue}, 100%, 84%, ${opacity})`;
        context.arc(meteor.x, meteor.y, 1.7 + intensity * 0.4, 0, Math.PI * 2);
        context.fill();

        if (meteor.x < -meteor.length || meteor.y > height * 0.78 || meteor.age > 150) {
          meteors[index] = makeMeteor(90 + Math.random() * 280);
        }
      });

      if (!reduceMotion) {
        animationId = window.requestAnimationFrame(drawFrame);
      }
    };

    resize();
    window.addEventListener("resize", resize);
    drawFrame();

    return () => {
      window.cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, [page]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="shooting-star-backdrop fixed inset-0 z-0 pointer-events-none h-full w-full"
    />
  );
}
