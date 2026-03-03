/**
 * Bacteria Actor
 * Draws small bacterial organisms
 */
import { applyEasing } from '../../utils/easing';

export class Bacteria {
    static draw(ctx, actor, progress, animation) {
        const x = actor.x;
        const y = actor.y;
        const size = actor.size || 20;
        const shape = actor.shape || 'rod'; // rod, sphere, spiral
        const color = actor.color || '#66BB6A';

        ctx.save();

        // Appear animation
        if (animation === 'appear') {
            ctx.save();
            const scale = applyEasing(progress, 'easeOut');
            ctx.translate(x, y);
            ctx.scale(scale, scale);
            ctx.translate(-x, -y);
            ctx.restore();
        }

        // Wiggle animation (movement)
        if (animation === 'wiggle' || animation === 'move') {
            ctx.save();
            const wiggleX = Math.sin(progress * Math.PI * 8) * 3;
            const wiggleY = Math.cos(progress * Math.PI * 6) * 2;
            ctx.translate(wiggleX, wiggleY);
            ctx.restore();
        }

        // Multiply animation
        if (animation === 'multiply') {
            ctx.save();
            const multiplyScale = 1 + Math.sin(progress * Math.PI * 2) * 0.2;
            ctx.translate(x, y);
            ctx.scale(multiplyScale, multiplyScale);
            ctx.translate(-x, -y);
            ctx.restore();
        }

        // Global shadow for depth
        ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        // Draw based on shape
        switch (shape) {
            case 'rod':
                this.drawRod(ctx, x, y, size, color);
                break;
            case 'sphere':
                this.drawSphere(ctx, x, y, size, color);
                break;
            case 'spiral':
                this.drawSpiral(ctx, x, y, size, color);
                break;
            default:
                this.drawRod(ctx, x, y, size, color);
        }

        // Reset shadow
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Multiply glow effect
        if (animation === 'multiply') {
            const glowAlpha = 0.4 + Math.sin(progress * Math.PI * 4) * 0.3;
            ctx.strokeStyle = `rgba(102, 187, 106, ${glowAlpha})`; // Based on color
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(x, y, size * 1.2, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();
    }

    static drawRod(ctx, x, y, size, color) {
        // Rod-shaped bacteria (bacillus)
        const width = size * 2;
        const height = size * 0.6;

        // Body gradient (linear for elongated shape)
        const bodyGradient = ctx.createLinearGradient(x - width / 2, y - height / 2, x + width / 2, y + height / 2);
        bodyGradient.addColorStop(0, this.lightenColor(color, 0.3)); // Lighter left/top
        bodyGradient.addColorStop(1, this.darkenColor(color, 0.2)); // Darker right/bottom
        ctx.fillStyle = bodyGradient;
        ctx.strokeStyle = this.darkenColor(color, 0.3);
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.ellipse(x - width / 4, y, height / 2, height / 2, 0, Math.PI / 2, Math.PI * 1.5);
        ctx.ellipse(x + width / 4, y, height / 2, height / 2, 0, -Math.PI / 2, Math.PI / 2);
        ctx.rect(x - width / 4, y - height / 2, width / 2, height);
        ctx.fill();
        ctx.stroke();

        // Body highlight (3D effect)
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.beginPath();
        ctx.rect(x - width / 2, y - height / 2, width / 2, height / 2);
        ctx.fill();

        // Add internal details with subtle stroke
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(x, y - height / 2);
        ctx.lineTo(x, y + height / 2);
        ctx.stroke();

        // Flagella with gradient stroke
        const flagellaGradient = ctx.createLinearGradient(x + width / 4, y, x + width * 0.8, y);
        flagellaGradient.addColorStop(0, color);
        flagellaGradient.addColorStop(1, this.darkenColor(color, 0.4));
        ctx.strokeStyle = flagellaGradient;
        ctx.lineWidth = 1.5;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x + width / 4, y);
        ctx.quadraticCurveTo(x + width / 2, y - size * 0.5, x + width * 0.8, y);
        ctx.stroke();

        // Flagella highlight
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(x + width / 4, y);
        ctx.quadraticCurveTo(x + width / 2 - 1, y - size * 0.5 + 1, x + width * 0.8 - 1, y);
        ctx.stroke();
    }

    static drawSphere(ctx, x, y, size, color) {
        // Spherical bacteria (coccus)
        const gradient = ctx.createRadialGradient(
            x - size * 0.3,
            y - size * 0.3,
            0,
            x,
            y,
            size * 0.8
        );
        gradient.addColorStop(0, this.lightenColor(color, 0.4)); // Brighter center
        gradient.addColorStop(0.7, color);
        gradient.addColorStop(1, this.darkenColor(color, 0.2)); // Darker edge

        ctx.fillStyle = gradient;
        ctx.strokeStyle = this.darkenColor(color, 0.3);
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.arc(x, y, size * 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Enhanced highlight
        const highlightGradient = ctx.createRadialGradient(x - size * 0.3, y - size * 0.3, 0, x - size * 0.3, y - size * 0.3, size * 0.3);
        highlightGradient.addColorStop(0, "rgba(255, 255, 255, 0.6)");
        highlightGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = highlightGradient;
        ctx.beginPath();
        ctx.arc(x - size * 0.3, y - size * 0.3, size * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Subtle internal structure (nucleus-like)
        ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
        ctx.beginPath();
        ctx.arc(x + size * 0.2, y + size * 0.1, size * 0.2, 0, Math.PI * 2);
        ctx.fill();
    }

    static drawSpiral(ctx, x, y, size, color) {
        // Spiral bacteria (spirillum)
        // Outer glow for spiral
        ctx.strokeStyle = `rgba(102, 187, 106, 0.3)`; // Light color
        ctx.lineWidth = size * 0.6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        for (let i = 0; i <= 20; i++) {
            const t = i / 20;
            const spiralX = x - size + t * size * 2;
            const spiralY = y + Math.sin(t * Math.PI * 4) * size * 0.5;
            if (i === 0) {
                ctx.moveTo(spiralX, spiralY);
            } else {
                ctx.lineTo(spiralX, spiralY);
            }
        }
        ctx.stroke();

        // Main spiral with linear gradient approximation
        const spiralGradient = ctx.createLinearGradient(x - size, y - size * 0.5, x + size, y + size * 0.5);
        spiralGradient.addColorStop(0, this.lightenColor(color, 0.2));
        spiralGradient.addColorStop(1, this.darkenColor(color, 0.3));
        ctx.strokeStyle = spiralGradient;
        ctx.lineWidth = size * 0.4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        for (let i = 0; i <= 20; i++) {
            const t = i / 20;
            const spiralX = x - size + t * size * 2;
            const spiralY = y + Math.sin(t * Math.PI * 4) * size * 0.5;
            if (i === 0) {
                ctx.moveTo(spiralX, spiralY);
            } else {
                ctx.lineTo(spiralX, spiralY);
            }
        }
        ctx.stroke();

        // Spiral highlight (parallel line)
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = size * 0.1;
        ctx.beginPath();
        for (let i = 0; i <= 20; i++) {
            const t = i / 20;
            const spiralX = x - size + t * size * 2 - 1; // Offset for highlight
            const spiralY = y + Math.sin(t * Math.PI * 4) * size * 0.5 - 1;
            if (i === 0) {
                ctx.moveTo(spiralX, spiralY);
            } else {
                ctx.lineTo(spiralX, spiralY);
            }
        }
        ctx.stroke();

        // Flagella with gradient
        const flagellaGradient = ctx.createLinearGradient(x + size, y, x + size * 2, y);
        flagellaGradient.addColorStop(0, color);
        flagellaGradient.addColorStop(1, this.darkenColor(color, 0.5));
        ctx.strokeStyle = flagellaGradient;
        ctx.lineWidth = 1.5;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x + size, y);
        ctx.quadraticCurveTo(x + size * 1.5, y - size * 0.5, x + size * 2, y);
        ctx.stroke();

        // Flagella highlight
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(x + size, y);
        ctx.quadraticCurveTo(x + size * 1.5 - 0.5, y - size * 0.5 + 0.5, x + size * 2 - 0.5, y);
        ctx.stroke();
    }

    // Helper methods for color manipulation (updated to hex and proper scaling)
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