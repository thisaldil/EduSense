/**
 * Asteroid Actor
 * Draws realistic rocky space objects with enhanced textures
 */
import { applyEasing } from '../../utils/easing';

export class Asteroid {
    static draw(ctx, actor, progress, animation) {
        const x = actor.x;
        const y = actor.y;
        const size = actor.size || 20;
        const color = actor.color || '#8B7355';
        const rotation = actor.rotation || 0;

        ctx.save();

        // Appear animation
        if (animation === 'appear') {
            const scale = applyEasing(progress, 'easeOut');
            ctx.translate(x, y);
            ctx.scale(scale, scale);
            ctx.translate(-x, -y);
        }

        // Rotate animation
        if (animation === 'rotate' || animation === 'spin') {
            ctx.translate(x, y);
            ctx.rotate(progress * Math.PI * 4);
            ctx.translate(-x, -y);
        }

        // Drift animation
        if (animation === 'drift') {
            const driftX = Math.sin(progress * Math.PI * 2) * 30;
            const driftY = Math.cos(progress * Math.PI * 2) * 20;
            ctx.translate(driftX, driftY);
        }

        // Shadow for depth
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        const points = 8;
        for (let i = 0; i < points; i++) {
            const angle = (i / points) * Math.PI * 2 + rotation;
            const seed = ((i * 7 + 11) % 100) / 100;
            const radius = size * (0.7 + seed * 0.3);
            const px = x + 2 + Math.cos(angle) * radius;
            const py = y + 2 + Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

        // Draw irregular asteroid shape with gradient
        const asteroidGradient = ctx.createRadialGradient(
            x - size * 0.3,
            y - size * 0.3,
            0,
            x,
            y,
            size
        );
        asteroidGradient.addColorStop(0, lightenColor(color, 40));
        asteroidGradient.addColorStop(0.5, color);
        asteroidGradient.addColorStop(1, darkenColor(color, 30));

        ctx.fillStyle = asteroidGradient;
        ctx.beginPath();

        for (let i = 0; i < points; i++) {
            const angle = (i / points) * Math.PI * 2 + rotation;
            const seed = ((i * 7 + 11) % 100) / 100;
            const radius = size * (0.7 + seed * 0.3);
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;

            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }

        ctx.closePath();
        ctx.fill();

        // Enhanced craters with depth
        const craterPositions = [
            { angle: 0, dist: 0.4, size: 0.15 },
            { angle: Math.PI * 2 / 3, dist: 0.35, size: 0.12 },
            { angle: Math.PI * 4 / 3, dist: 0.3, size: 0.1 },
            { angle: Math.PI, dist: 0.25, size: 0.08 }
        ];

        craterPositions.forEach(crater => {
            const craterX = x + Math.cos(crater.angle) * size * crater.dist;
            const craterY = y + Math.sin(crater.angle) * size * crater.dist;

            // Crater shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.beginPath();
            ctx.arc(craterX, craterY, size * crater.size, 0, Math.PI * 2);
            ctx.fill();

            // Crater highlight
            ctx.fillStyle = 'rgba(139, 115, 85, 0.3)';
            ctx.beginPath();
            ctx.arc(
                craterX - size * crater.size * 0.3,
                craterY - size * crater.size * 0.3,
                size * crater.size * 0.5,
                0,
                Math.PI * 2
            );
            ctx.fill();
        });

        // Enhanced highlight with gradient
        const highlightGradient = ctx.createRadialGradient(
            x - size * 0.3,
            y - size * 0.3,
            0,
            x - size * 0.3,
            y - size * 0.3,
            size * 0.4
        );
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        highlightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = highlightGradient;
        ctx.beginPath();
        ctx.arc(x - size * 0.3, y - size * 0.3, size * 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Rock texture details
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2 + 0.5;
            const dist = 0.2 + (i * 0.1);
            const detailX = x + Math.cos(angle) * size * dist;
            const detailY = y + Math.sin(angle) * size * dist;
            ctx.beginPath();
            ctx.arc(detailX, detailY, size * 0.05, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}