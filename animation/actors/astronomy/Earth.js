/**
 * Earth Actor
 * Draws a realistic globe with continents, clouds, and atmosphere
 */
import { applyEasing } from '../../utils/easing';

export class Earth {
    static draw(ctx, actor, progress, animation) {
        const x = actor.x;
        const y = actor.y;
        const radius = actor.size || 50;
        const rotation = actor.rotation || 0;

        ctx.save();

        // Rotate for spin animation
        if (animation === 'spin') {
            ctx.translate(x, y);
            ctx.rotate(progress * Math.PI * 2);
            ctx.translate(-x, -y);
        }

        // Appear animation
        if (animation === 'appear') {
            const scale = applyEasing(progress, 'easeOut');
            ctx.translate(x, y);
            ctx.scale(scale, scale);
            ctx.translate(-x, -y);
        }

        // Shadow (behind Earth for depth)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(x + 3, y + 3, radius, radius * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw ocean (base) with improved gradient
        const oceanGradient = ctx.createRadialGradient(
            x - radius * 0.3,
            y - radius * 0.3,
            0,
            x,
            y,
            radius
        );
        oceanGradient.addColorStop(0, '#5DD5FF');
        oceanGradient.addColorStop(0.4, '#4FC3F7');
        oceanGradient.addColorStop(0.7, '#2196F3');
        oceanGradient.addColorStop(1, '#1565C0');

        ctx.fillStyle = oceanGradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw continents with gradient for depth
        const landGradient = ctx.createRadialGradient(
            x - radius * 0.2,
            y - radius * 0.2,
            0,
            x,
            y,
            radius * 1.2
        );
        landGradient.addColorStop(0, '#66BB6A');
        landGradient.addColorStop(0.5, '#4CAF50');
        landGradient.addColorStop(1, '#2E7D32');
        ctx.fillStyle = landGradient;

        // North America
        ctx.beginPath();
        ctx.ellipse(x - radius * 0.3, y - radius * 0.2,
            radius * 0.25, radius * 0.35, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // South America
        ctx.beginPath();
        ctx.ellipse(x - radius * 0.2, y + radius * 0.3,
            radius * 0.15, radius * 0.3, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Africa/Europe
        ctx.beginPath();
        ctx.ellipse(x + radius * 0.1, y,
            radius * 0.3, radius * 0.4, 0.1, 0, Math.PI * 2);
        ctx.fill();

        // Asia
        ctx.beginPath();
        ctx.ellipse(x + radius * 0.4, y - radius * 0.1,
            radius * 0.35, radius * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Add terrain texture to continents
        ctx.fillStyle = 'rgba(46, 125, 50, 0.3)';
        // North America detail
        ctx.beginPath();
        ctx.ellipse(x - radius * 0.35, y - radius * 0.15,
            radius * 0.12, radius * 0.18, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Africa detail
        ctx.beginPath();
        ctx.ellipse(x + radius * 0.15, y + radius * 0.05,
            radius * 0.15, radius * 0.2, 0.1, 0, Math.PI * 2);
        ctx.fill();

        // Ice caps
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        // North pole
        ctx.beginPath();
        ctx.ellipse(x, y - radius * 0.85,
            radius * 0.3, radius * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();

        // South pole
        ctx.beginPath();
        ctx.ellipse(x, y + radius * 0.85,
            radius * 0.25, radius * 0.12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Enhanced clouds with varying opacity
        const cloudPositions = [
            { x: x + radius * 0.2, y: y + radius * 0.4, size: radius * 0.15, alpha: 0.4 },
            { x: x - radius * 0.4, y: y - radius * 0.3, size: radius * 0.1, alpha: 0.35 },
            { x: x + radius * 0.5, y: y + radius * 0.1, size: radius * 0.12, alpha: 0.3 },
            { x: x - radius * 0.1, y: y + radius * 0.5, size: radius * 0.08, alpha: 0.38 }
        ];

        cloudPositions.forEach(cloud => {
            ctx.fillStyle = `rgba(255, 255, 255, ${cloud.alpha})`;
            ctx.beginPath();
            ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
            ctx.fill();
        });

        // Enhanced atmosphere glow (multiple layers)
        // Outer glow
        ctx.strokeStyle = 'rgba(100, 200, 255, 0.2)';
        ctx.lineWidth = 12;
        ctx.beginPath();
        ctx.arc(x, y, radius + 6, 0, Math.PI * 2);
        ctx.stroke();

        // Inner glow
        ctx.strokeStyle = 'rgba(100, 200, 255, 0.4)';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(x, y, radius + 3, 0, Math.PI * 2);
        ctx.stroke();

        // Enhanced highlight (3D effect)
        const highlightGradient = ctx.createRadialGradient(
            x - radius * 0.3,
            y - radius * 0.3,
            0,
            x - radius * 0.3,
            y - radius * 0.3,
            radius * 0.4
        );
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
        highlightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = highlightGradient;
        ctx.beginPath();
        ctx.ellipse(
            x - radius * 0.3,
            y - radius * 0.3,
            radius * 0.35,
            radius * 0.25,
            0,
            0,
            Math.PI * 2
        );
        ctx.fill();

        // Pulse animation with gradient
        if (animation === 'pulse') {
            const pulseScale = 1.0 + Math.sin(progress * Math.PI * 4) * 0.15;
            const pulseAlpha = 0.4 + Math.sin(progress * Math.PI * 4) * 0.2;

            ctx.strokeStyle = `rgba(100, 200, 255, ${pulseAlpha})`;
            ctx.lineWidth = 12;
            ctx.beginPath();
            ctx.arc(x, y, radius * pulseScale + 8, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Fade animation
        if (animation === 'fade') {
            ctx.globalAlpha = progress;
        }

        ctx.restore();
    }
}