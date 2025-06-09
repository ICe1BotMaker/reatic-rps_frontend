import React, { useCallback, useEffect, useRef } from "react";

interface ParticleProps {
    x: number;
    y: number;
    vx: number;
    vy: number;
    gravity: number;
    airResistance: number;
    color: string;
    width: number;
    height: number;
    rotation: number;
    rotationSpeed: number;
    swaySpeed: number;
    swayAmount: number;
}

class Particle implements ParticleProps {
    x: number;
    y: number;
    vx: number;
    vy: number;
    gravity: number;
    airResistance: number;
    color: string;
    width: number;
    height: number;
    rotation: number;
    rotationSpeed: number;
    swaySpeed: number;
    swayAmount: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 6;
        this.vy = Math.random() * 2 + 1;
        this.gravity = 0.05;
        this.airResistance = 0.99;
        this.color = this.getRandomColor();
        this.width = Math.random() * 12 + 8;
        this.height = Math.random() * 16 + 6;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.15;
        this.swaySpeed = Math.random() * 0.02 + 0.01;
        this.swayAmount = Math.random() * 2 + 1;
    }

    private getRandomColor(): string {
        const colors: string[] = [
            "#ff6b6b",
            "#4ecdc4",
            "#45b7d1",
            "#96ceb4",
            "#ffeaa7",
            "#dda0dd",
            "#98d8c8",
            "#a8e6cf",
            "#ff8c94",
            "#c7ceea",
            "#b4f8c8",
            "#fbe7c6",
            "#f39c12",
            "#e74c3c",
            "#9b59b6",
            "#3498db",
            "#2ecc71",
            "#f1c40f",
            "#e67e22",
            "#1abc9c",
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    update(): void {
        this.vx += Math.sin(this.y * this.swaySpeed) * this.swayAmount * 0.01;
        this.vx *= this.airResistance;

        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.rotation += this.rotationSpeed;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.fillStyle = this.color;

        ctx.fillRect(
            -this.width / 2,
            -this.height / 2,
            this.width,
            this.height
        );

        ctx.strokeStyle = "rgba(0,0,0,0.1)";
        ctx.lineWidth = 0.5;
        ctx.strokeRect(
            -this.width / 2,
            -this.height / 2,
            this.width,
            this.height
        );

        ctx.restore();
    }

    isDead(canvasHeight: number): boolean {
        return this.y > canvasHeight + 50;
    }
}

const ConfettiEffect: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const animationRef = useRef<number | null>(null);
    const particlesRef = useRef<Particle[]>([]);
    const startedRef = useRef<boolean>(false);

    const createParticles = (): void => {
        if (startedRef.current) return;
        startedRef.current = true;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const particleCount = 120;
        for (let i = 0; i < particleCount; i++) {
            const x = Math.random() * canvas.width;
            const y = -50 - Math.random() * 100;
            particlesRef.current.push(new Particle(x, y));
        }
    };

    const animate = useCallback((): void => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particlesRef.current = particlesRef.current.filter((particle) => {
            particle.update();
            particle.draw(ctx);
            return !particle.isDead(canvas.height);
        });

        if (particlesRef.current.length > 0) {
            animationRef.current = requestAnimationFrame(animate);
        }
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const resizeCanvas = (): void => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        setTimeout(() => {
            createParticles();
            animate();
        }, 100);

        return () => {
            window.removeEventListener("resize", resizeCanvas);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [animate]);

    return (
        <canvas
            ref={canvasRef}
            className="bg-transparent fixed top-0 left-0 z-[1000] pointer-events-none w-screen h-screen"
        />
    );
};

export default ConfettiEffect;
