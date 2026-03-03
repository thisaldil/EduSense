/**
 * Mountain Actor
 * Draws mountain ranges
 */
import { applyEasing } from '../../utils/easing';

export class Mountain {
    static draw(ctx, actor, progress, animation) {
        const x = actor.x;
        const y = actor.y;
        const width = actor.width || 200;
        const height = actor.height || 150;
        const peaks = actor.peaks || 3;
        const color = actor.color || '#8D6E63';
        const snowCap = actor.snowCap !== false;

        ctx.save();

        // Global shadow for depth
        ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;

        // Appear/Grow animation (scale from base)
        let scaleY = 1;
        if (animation === 'appear' || animation === 'grow') {
            scaleY = applyEasing(progress, 'easeOut');
            ctx.translate(x, y);
            ctx.scale(1, scaleY);
            ctx.translate(-x, -y);
        }

        // Draw base mountain shape (path for clipping later)
        ctx.beginPath();
        ctx.moveTo(x - width / 2, y);

        // Create peaks with fixed variations (no random for consistency)
        for (let i = 0; i <= peaks; i++) {
            const peakX = x - width / 2 + (i / peaks) * width;
            const variation = Math.sin(i * Math.PI / peaks) * 0.3; // Fixed sine variation
            const peakHeight = height * (0.6 + variation);
            const peakY = y - peakHeight;

            // Valley between peaks
            if (i > 0) {
                const valleyX = peakX - width / (peaks * 2);
                const valleyY = y - height * 0.3;
                ctx.lineTo(valleyX, valleyY);
            }

            ctx.lineTo(peakX, peakY);
        }

        ctx.lineTo(x + width / 2, y);
        ctx.closePath();

        // Base fill with linear gradient for depth
        const baseGradient = ctx.createLinearGradient(x - width / 2, y - height, x + width / 2, y);
        baseGradient.addColorStop(0, this.lightenColor(color, 0.2)); // Lighter left (sunlit)
        baseGradient.addColorStop(0.5, color);
        baseGradient.addColorStop(1, this.darkenColor(color, 0.3)); // Darker right
        ctx.fillStyle = baseGradient;
        ctx.fill();

        // Reset shadow for overlays
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Shading overlay (clipped to shape)
        ctx.save();
        ctx.clip(); // Clip to mountain shape
        const shadeGradient = ctx.createLinearGradient(x - width / 2, y - height, x + width / 2, y);
        shadeGradient.addColorStop(0, 'rgba(0, 0, 0, 0.1)');
        shadeGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
        shadeGradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
        ctx.fillStyle = shadeGradient;
        ctx.fillRect(x - width / 2, y - height, width, height);
        ctx.restore();

        // Highlight (3D effect on left side)
        ctx.save();
        ctx.clip();
        const highlightGradient = ctx.createLinearGradient(x - width / 2, y - height, x, y);
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = highlightGradient;
        ctx.fillRect(x - width / 2, y - height, width / 2, height);
        ctx.restore();

        // Add snow caps with gradients
        if (snowCap) {
            for (let i = 0; i <= peaks; i++) {
                const peakX = x - width / 2 + (i / peaks) * width;
                const variation = Math.sin(i * Math.PI / peaks) * 0.3;
                const peakHeight = height * (0.6 + variation);
                const peakY = y - peakHeight;

                // Snow cap gradient (white to light blue)
                const snowGradient = ctx.createLinearGradient(peakX - 15, peakY + 20, peakX, peakY);
                snowGradient.addColorStop(0, '#E3F2FD'); // Light blue tint
                snowGradient.addColorStop(1, '#FFFFFF');
                ctx.fillStyle = snowGradient;
                ctx.beginPath();
                ctx.moveTo(peakX - 15, peakY + 20);
                ctx.lineTo(peakX, peakY);
                ctx.lineTo(peakX + 15, peakY + 20);
                ctx.closePath();
                ctx.fill();

                // Snow highlight
                ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
                ctx.beginPath();
                ctx.moveTo(peakX - 10, peakY + 10);
                ctx.lineTo(peakX, peakY);
                ctx.lineTo(peakX - 5, peakY + 10);
                ctx.closePath();
                ctx.fill();
            }
        }

        // Mountain details (rocks/textures) - fixed positions for consistency
        ctx.strokeStyle = this.darkenColor(color, 0.5);
        ctx.lineWidth = 1.5;
        ctx.lineCap = "round";
        for (let i = 0; i < 5; i++) {
            const detailX = x - width / 3 + (i / 4) * width / 1.5;
            const detailY = y - (height * 0.4 + Math.sin(i * Math.PI / 2.5) * height * 0.3);

            ctx.beginPath();
            ctx.moveTo(detailX, detailY);
            ctx.quadraticCurveTo(detailX + 5, detailY + 8, detailX + 12, detailY + 15);
            ctx.stroke();
        }

        // Subtle texture lines
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < peaks; i++) {
            const peakX = x - width / 2 + (i / peaks) * width;
            ctx.beginPath();
            ctx.moveTo(peakX - 20, y - height * 0.5);
            ctx.lineTo(peakX + 20, y - height * 0.5);
            ctx.stroke();
        }

        ctx.restore();
    }

    // Helper methods for color manipulation
    static lightenColor(hex, percent) {
        const num = parseInt(hex.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent * 100);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }

    static darkenColor(hex, percent) {
        const num = parseInt(hex.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent * 100);
        const R = (num >> 16) - amt > 0 ? (num >> 16) - amt : 0;
        const G = (num >> 8 & 0x00FF) - amt > 0 ? (num >> 8 & 0x00FF) - amt : 0;
        const B = (num & 0x0000FF) - amt > 0 ? (num & 0x0000FF) - amt : 0;
        return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }
}