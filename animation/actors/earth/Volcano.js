/**
 * Volcano Actor
 * Draws volcanoes with smoke and lava
 */
import { applyEasing } from '../../utils/easing';

export class Volcano {
    static draw(ctx, actor, progress, animation) {
        const x = actor.x;
        const y = actor.y;
        const width = actor.width || 200;
        const height = actor.height || 150;
        const erupting = actor.erupting !== false;
        const color = actor.color || '#8B4513';

        ctx.save();

        // Appear animation
        if (animation === 'appear') {
            const scale = applyEasing(progress, 'easeOut');
            ctx.translate(x, y);
            ctx.scale(1, scale);
            ctx.translate(-x, -y);
        }

        // Draw volcano body
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x - width / 2, y);
        ctx.lineTo(x - width / 4, y - height * 0.8);
        ctx.lineTo(x, y - height);
        ctx.lineTo(x + width / 4, y - height * 0.8);
        ctx.lineTo(x + width / 2, y);
        ctx.closePath();
        ctx.fill();

        // Add shading
        const gradient = ctx.createLinearGradient(x - width / 2, y - height, x + width / 2, y);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw crater
        ctx.fillStyle = '#3E2723';
        ctx.beginPath();
        ctx.ellipse(x, y - height, width * 0.15, height * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();

        if (erupting && (animation === 'erupt' || animation === 'idle')) {
            // Draw lava flow
            const lavaProgress = animation === 'erupt' ? progress : Math.abs(Math.sin(progress * Math.PI * 2));

            ctx.fillStyle = '#FF5722';
            ctx.beginPath();
            ctx.moveTo(x - 5, y - height);
            ctx.quadraticCurveTo(
                x - 20,
                y - height + (height * 0.5 * lavaProgress),
                x - 40,
                y - height + (height * lavaProgress)
            );
            ctx.lineTo(x - 30, y - height + (height * lavaProgress));
            ctx.quadraticCurveTo(
                x - 15,
                y - height + (height * 0.5 * lavaProgress),
                x,
                y - height
            );
            ctx.closePath();
            ctx.fill();

            // Add glow to lava
            ctx.shadowColor = '#FF5722';
            ctx.shadowBlur = 15;
            ctx.fill();
            ctx.shadowBlur = 0;

            // Draw smoke/ash clouds
            const smokeCount = 5;
            for (let i = 0; i < smokeCount; i++) {
                const smokeOffset = (i / smokeCount) * 0.3;
                const smokeProgress = Math.max(0, Math.min(1, (progress - smokeOffset) * 1.5));

                // Deterministic smoke position
                const seedX = ((i * 7 + 13) % 100) / 100;
                const smokeX = x + (seedX - 0.5) * 40;
                const smokeY = y - height - (smokeProgress * 100);
                const smokeSize = 20 + smokeProgress * 30;

                ctx.fillStyle = `rgba(100, 100, 100, ${0.6 - smokeProgress * 0.5})`;
                ctx.beginPath();
                ctx.arc(smokeX, smokeY, smokeSize, 0, Math.PI * 2);
                ctx.fill();
            }

            // Draw sparks/particles
            if (animation === 'erupt') {
                for (let i = 0; i < 10; i++) {
                    const angle = (i / 10) * Math.PI * 2;
                    const sparkProgress = progress * 1.5;
                    const sparkDist = sparkProgress * 60;
                    const sparkX = x + Math.cos(angle) * sparkDist;
                    const sparkY = y - height - Math.abs(Math.sin(angle)) * sparkDist;

                    ctx.fillStyle = `rgba(255, 150, 0, ${1 - sparkProgress})`;
                    ctx.beginPath();
                    ctx.arc(sparkX, sparkY, 3, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }

        // Rumble animation
        if (animation === 'rumble') {
            const rumbleX = Math.sin(progress * Math.PI * 20) * 2;
            ctx.translate(rumbleX, 0);
        }

        ctx.restore();
    }
}