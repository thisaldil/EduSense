/**
 * Root Actor
 * Draws root systems with branching and absorption
 */
import { applyEasing } from '../../utils/easing';

export class Root {
    static draw(ctx, actor, progress, animation) {
        const x = actor.x;
        const y = actor.y;
        const depth = actor.depth || 100;
        const width = actor.width || 80;
        const color = actor.color || '#8B4513';
        const branches = actor.branches || 5;

        ctx.save();

        // Global shadow for depth
        ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        // Appear animation (grow from top)
        if (animation === 'appear' || animation === 'grow') {
            ctx.save();
            const growProgress = applyEasing(progress, 'easeOut');
            ctx.translate(x, y);
            ctx.scale(1, growProgress);
            ctx.translate(-x, -y);
        }

        // Draw main root with gradient
        const mainGradient = ctx.createLinearGradient(x, y, x, y + depth);
        mainGradient.addColorStop(0, this.lightenColor(color, 0.3)); // Lighter top
        mainGradient.addColorStop(1, this.darkenColor(color, 0.4)); // Darker bottom
        ctx.strokeStyle = mainGradient;
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + depth);
        ctx.stroke();

        // Reset shadow for highlights
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Main root highlight (3D effect)
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.lineWidth = 1.5;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x - 1, y);
        ctx.lineTo(x - 1, y + depth);
        ctx.stroke();

        // Subtle internal texture (cross lines)
        ctx.strokeStyle = this.darkenColor(color, 0.5);
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
            const texY = y + (depth / 4) * (i + 1);
            ctx.beginPath();
            ctx.moveTo(x - 2, texY);
            ctx.lineTo(x + 2, texY);
            ctx.stroke();
        }

        // Draw root branches with gradients
        ctx.lineWidth = 3;
        for (let i = 0; i < branches; i++) {
            const branchY = y + (depth / branches) * (i + 1);
            const branchLength = width / 2 - (i * 5);
            const branchAngle = 0.3 + (i * 0.1);

            // Left branch
            const leftGradient = ctx.createLinearGradient(x, branchY, x - branchLength, branchY + branchLength);
            leftGradient.addColorStop(0, this.darkenColor(color, 0.2));
            leftGradient.addColorStop(1, this.darkenColor(color, 0.5));
            ctx.strokeStyle = leftGradient;
            ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
            ctx.shadowBlur = 2;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
            ctx.beginPath();
            ctx.moveTo(x, branchY);
            ctx.quadraticCurveTo(
                x - branchLength / 2,
                branchY + branchLength / 2,
                x - branchLength,
                branchY + branchLength
            );
            ctx.stroke();

            // Left branch highlight
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(x - 0.5, branchY);
            ctx.quadraticCurveTo(
                x - branchLength / 2 - 0.5,
                branchY + branchLength / 2 + 0.5,
                x - branchLength - 0.5,
                branchY + branchLength + 0.5
            );
            ctx.stroke();

            // Right branch
            const rightGradient = ctx.createLinearGradient(x, branchY, x + branchLength, branchY + branchLength);
            rightGradient.addColorStop(0, this.darkenColor(color, 0.2));
            rightGradient.addColorStop(1, this.darkenColor(color, 0.5));
            ctx.strokeStyle = rightGradient;
            ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
            ctx.shadowBlur = 2;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
            ctx.beginPath();
            ctx.moveTo(x, branchY);
            ctx.quadraticCurveTo(
                x + branchLength / 2,
                branchY + branchLength / 2,
                x + branchLength,
                branchY + branchLength
            );
            ctx.stroke();

            // Right branch highlight
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(x + 0.5, branchY);
            ctx.quadraticCurveTo(
                x + branchLength / 2 + 0.5,
                branchY + branchLength / 2 + 0.5,
                x + branchLength + 0.5,
                branchY + branchLength + 0.5
            );
            ctx.stroke();
        }

        // Draw root hairs (thin lines) - deterministic
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = this.lightenColor(color, 0.4);
        ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
        ctx.shadowBlur = 1;
        for (let i = 0; i < 10; i++) {
            // Deterministic positioning
            const seedY = ((i * 11 + 17) % 100) / 100;
            const seedX = ((i * 13 + 19) % 100) / 100;
            const seedLen = ((i * 7 + 23) % 100) / 100;
            const seedOffset = ((i * 5 + 29) % 100) / 100;

            const hairY = y + seedY * depth;
            const hairX = x + (seedX - 0.5) * width;
            const hairLength = 10 + seedLen * 15;

            ctx.beginPath();
            ctx.moveTo(hairX, hairY);
            ctx.lineTo(hairX + (seedOffset - 0.5) * 10, hairY + hairLength);
            ctx.stroke();
        }
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Absorb animation (particles moving up) with glow
        if (animation === 'absorb') {
            ctx.shadowColor = "rgba(33, 150, 243, 0.5)";
            ctx.shadowBlur = 4;
            for (let i = 0; i < 5; i++) {
                const particleProgress = (progress + i * 0.2) % 1;
                const particleY = y + depth - particleProgress * depth;
                // Deterministic particle movement
                const seed = ((i * 7 + 13) % 100) / 100;
                const particleX = x + Math.sin(particleProgress * Math.PI * 4 + seed * Math.PI * 2) * 10;

                // Particle glow
                const particleGradient = ctx.createRadialGradient(particleX, particleY, 0, particleX, particleY, 4);
                particleGradient.addColorStop(0, '#4FC3F7');
                particleGradient.addColorStop(1, 'rgba(33, 150, 243, 0)');
                ctx.fillStyle = particleGradient;
                ctx.beginPath();
                ctx.arc(particleX, particleY, 4, 0, Math.PI * 2);
                ctx.fill();

                // Main particle
                ctx.fillStyle = '#2196F3';
                ctx.beginPath();
                ctx.arc(particleX, particleY, 3, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.shadowBlur = 0;
        }

        if (animation === 'appear' || animation === 'grow') {
            ctx.restore();
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