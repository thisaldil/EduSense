/**
 * Number Actor
 * Draws animated numbers with counting and transition effects
 */
import { applyEasing } from '../../utils/easing';

export class Number {
    static draw(ctx, actor, progress, animation) {
        const x = actor.x || 0;
        const y = actor.y || 0;
        const value = actor.value || 0;
        const fontSize = actor.fontSize || 48;
        const color = actor.color || '#FFFFFF';
        const fontFamily = actor.fontFamily || 'Arial';
        const fromValue = actor.fromValue || 0; // For transitions

        ctx.save();

        // Translate to position
        ctx.translate(x, y);

        // Global shadow for depth
        ctx.shadowColor = this.darkenColor(color, 0.6);
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        // Appear animation
        if (animation === 'appear') {
            ctx.save();
            const scale = applyEasing(progress, 'easeOut');
            ctx.scale(scale, scale);
            ctx.restore();
        }

        // Set text properties
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Calculate displayed value
        let displayValue;
        if (animation === 'countUp' || animation === 'transition') {
            const start = fromValue || 0;
            const end = value;
            const easedProgress = applyEasing(progress, 'easeInOut');
            displayValue = Math.round(start + (end - start) * easedProgress);
        } else {
            displayValue = value;
        }

        const text = displayValue.toString();
        const textMetrics = ctx.measureText(text);
        const textWidth = textMetrics.width;

        // Reset shadow for text to avoid over-blurring
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Text gradient (horizontal for shine)
        const textGradient = ctx.createLinearGradient(-textWidth / 2, 0, textWidth / 2, 0);
        textGradient.addColorStop(0, this.lightenColor(color, 0.3)); // Brighter left
        textGradient.addColorStop(0.7, color);
        textGradient.addColorStop(1, this.darkenColor(color, 0.2)); // Darker right
        ctx.fillStyle = textGradient;

        // Draw the number
        ctx.fillText(text, 0, 0);

        // Text outline for depth
        ctx.strokeStyle = this.darkenColor(color, 0.5);
        ctx.lineWidth = 1;
        ctx.strokeText(text, 0, 0);

        // Text highlight (subtle shine)
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.fillText(text, -1, -1);

        // Add glow effect for emphasis
        if (animation === 'pulse' || animation === 'highlight') {
            const glowIntensity = 10 * (1 + Math.sin(progress * Math.PI * 4) * 0.5);
            ctx.shadowColor = color;
            ctx.shadowBlur = glowIntensity;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.fillText(text, 0, 0);
            ctx.shadowBlur = 0;
        }

        // Pulse animation with scale and enhanced glow
        if (animation === 'pulse') {
            ctx.save();
            const pulseScale = 1 + Math.sin(progress * Math.PI * 4) * 0.1;
            ctx.scale(pulseScale, pulseScale);

            // Pulse glow overlay
            const pulseGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, fontSize * 1.5);
            pulseGlow.addColorStop(0, `rgba(${this.hexToRgb(color)}, ${0.3 + Math.sin(progress * Math.PI * 4) * 0.2})`);
            pulseGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = pulseGlow;
            ctx.fillRect(-textWidth / 2 - 10, -fontSize / 2 - 10, textWidth + 20, fontSize + 20);
            ctx.restore();
        }

        // Shake animation for alerts/errors
        if (animation === 'shake') {
            const shakeX = Math.sin(progress * Math.PI * 20) * 3;
            const shakeY = Math.abs(Math.cos(progress * Math.PI * 10)) * 2;
            ctx.save();
            ctx.translate(shakeX, shakeY);
            ctx.fillText(text, 0, 0);
            ctx.restore();
        }

        // Draw decimal point if fractional
        if (value % 1 !== 0 && animation !== 'countUp' && animation !== 'transition') {
            const decimalText = '.';
            const decimalX = textWidth / 2 + ctx.measureText(decimalText).width / 2;
            ctx.fillStyle = textGradient; // Match number gradient
            ctx.fillText(decimalText, decimalX, 0);
            ctx.strokeStyle = this.darkenColor(color, 0.5);
            ctx.lineWidth = 0.5;
            ctx.strokeText(decimalText, decimalX, 0);
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

    static hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255, 255, 255';
    }
}