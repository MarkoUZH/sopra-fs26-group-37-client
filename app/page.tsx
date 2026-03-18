"use client";
import { useRouter } from "next/navigation";
import { Button } from "antd";
import styles from "@/styles/page.module.css";
import { useEffect, useRef } from "react";

export default function Home() {
    const router = useRouter();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const text = "Group 37";
        const particles: { x: number; y: number; tx: number; ty: number; vx: number; vy: number; color: string }[] = [];
        const mouse: { x: number | null; y: number | null } = { x: null, y: null };

        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        const W = canvas.width;
        const H = canvas.height;

        ctx.font = `bold ${W / 5}px sans-serif`;
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, W / 2, H / 2);

        const imageData = ctx.getImageData(0, 0, W, H);
        ctx.clearRect(0, 0, W, H);

        const gap = 5;
        for (let y = 0; y < H; y += gap) {
            for (let x = 0; x < W; x += gap) {
                const i = (y * W + x) * 4;
                if (imageData.data[i + 3] > 128) {
                    particles.push({
                        x: Math.random() * W,
                        y: Math.random() * H,
                        tx: x,
                        ty: y,
                        vx: 0,
                        vy: 0,
                        color: `hsl(${200 + Math.random() * 60}, 80%, 65%)`,
                    });
                }
            }
        }

        const onMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        };

        const onMouseLeave = () => {
            mouse.x = null;
            mouse.y = null;
        };

        canvas.addEventListener("mousemove", onMouseMove);
        canvas.addEventListener("mouseleave", onMouseLeave);

        let animId: number;

        function animate() {
            if (!ctx) return;
            ctx.clearRect(0, 0, W, H);
            for (const p of particles) {
                const dx = p.tx - p.x;
                const dy = p.ty - p.y;
                let ax = dx * 0.08;
                let ay = dy * 0.08;

                if (mouse.x !== null && mouse.y !== null) {
                    const mx = p.x - mouse.x;
                    const my = p.y - mouse.y;
                    const dist = Math.sqrt(mx * mx + my * my);
                    if (dist < 80) {
                        const force = (80 - dist) / 80;
                        ax += (mx / dist) * force * 8;
                        ay += (my / dist) * force * 8;
                    }
                }

                p.vx = (p.vx + ax) * 0.85;
                p.vy = (p.vy + ay) * 0.85;
                p.x += p.vx;
                p.y += p.vy;

                ctx.fillStyle = p.color;
                ctx.fillRect(p.x, p.y, 3, 3);
            }
            animId = requestAnimationFrame(animate);
        }

        animate();

        return () => {
            cancelAnimationFrame(animId);
            canvas.removeEventListener("mousemove", onMouseMove);
            canvas.removeEventListener("mouseleave", onMouseLeave);
        };
    }, []);

    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <canvas
                    ref={canvasRef}
                    style={{ width: "100%", height: "200px", cursor: "none" }}
                />
                <div className={styles.ctas}>
                    <Button
                        type="primary"
                        variant="solid"
                        onClick={() => router.push("/login")}
                    >
                        Go to login
                    </Button>
                </div>
            </main>
        </div>
    );
}