/**
 * Atom Actor
 * Draws atomic structure with nucleus and electron shells
 */
import { applyEasing } from '../../utils/easing';

export class Atom {
    static draw(ctx, actor, progress, animation) {
        const x = actor.x;
        const y = actor.y;
        const size = actor.size || 50;
        const electrons = actor.electrons || 6; // Number of electrons
        const shells = actor.shells || 2; // Number of electron shells
        const element = actor.element || 'generic';

        ctx.save();

        // Global shadow for depth
        ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        // Appear animation
        if (animation === 'appear') {
            const scale = applyEasing(progress, 'easeOut');
            ctx.translate(x, y);
            ctx.scale(scale, scale);
            ctx.translate(-x, -y);
        }

        // Draw nucleus
        const nucleusSize = size * 0.3;
        const nucleusGradient = ctx.createRadialGradient(
            x - nucleusSize * 0.3,
            y - nucleusSize * 0.3,
            0,
            x,
            y,
            nucleusSize
        );
        nucleusGradient.addColorStop(0, '#FFF9C4'); // Brighter center
        nucleusGradient.addColorStop(0.5, '#FBC02D');
        nucleusGradient.addColorStop(1, '#F57F17'); // Darker edge

        ctx.fillStyle = nucleusGradient;
        ctx.beginPath();
        ctx.arc(x, y, nucleusSize, 0, Math.PI * 2);
        ctx.fill();

        // Nucleus highlight (3D effect)
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.beginPath();
        ctx.arc(x - nucleusSize * 0.2, y - nucleusSize * 0.2, nucleusSize * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Reset shadow for sub-particles to avoid over-blurring
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Draw protons and neutrons in nucleus with individual shadows and highlights
        ctx.fillStyle = '#E53935'; // Proton color
        for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2;
            const nx = x + Math.cos(angle) * nucleusSize * 0.4;
            const ny = y + Math.sin(angle) * nucleusSize * 0.4;

            // Proton shadow
            ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
            ctx.shadowBlur = 2;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;

            // Proton gradient
            const protonGradient = ctx.createRadialGradient(nx - 2, ny - 2, 0, nx, ny, nucleusSize * 0.25);
            protonGradient.addColorStop(0, this.lightenColor('#E53935', 0.3));
            protonGradient.addColorStop(1, '#C62828');
            ctx.fillStyle = protonGradient;
            ctx.beginPath();
            ctx.arc(nx, ny, nucleusSize * 0.25, 0, Math.PI * 2);
            ctx.fill();

            // Proton highlight
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
            ctx.beginPath();
            ctx.arc(nx - 1, ny - 1, nucleusSize * 0.1, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.fillStyle = '#9E9E9E'; // Neutron color
        for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2 + Math.PI / 3;
            const nx = x + Math.cos(angle) * nucleusSize * 0.4;
            const ny = y + Math.sin(angle) * nucleusSize * 0.4;

            // Neutron shadow
            ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
            ctx.shadowBlur = 2;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;

            // Neutron gradient
            const neutronGradient = ctx.createRadialGradient(nx - 2, ny - 2, 0, nx, ny, nucleusSize * 0.25);
            neutronGradient.addColorStop(0, this.lightenColor('#9E9E9E', 0.3));
            neutronGradient.addColorStop(1, '#424242');
            ctx.fillStyle = neutronGradient;
            ctx.beginPath();
            ctx.arc(nx, ny, nucleusSize * 0.25, 0, Math.PI * 2);
            ctx.fill();

            // Neutron highlight
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
            ctx.beginPath();
            ctx.arc(nx - 1, ny - 1, nucleusSize * 0.1, 0, Math.PI * 2);
            ctx.fill();
        }

        // Global shadow back on for shells
        ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
        ctx.shadowBlur = 2;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        // Draw electron shells with gradient stroke
        for (let shell = 1; shell <= shells; shell++) {
            const shellRadius = size * (0.5 + shell * 0.3);
            const shellGradient = ctx.createLinearGradient(x - shellRadius, y, x + shellRadius, y);
            shellGradient.addColorStop(0, 'rgba(66, 165, 245, 0.4)');
            shellGradient.addColorStop(1, 'rgba(66, 165, 245, 0.1)');
            ctx.strokeStyle = shellGradient;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, y, shellRadius, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Reset shadow for electrons
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Draw electrons orbiting with enhanced glow
        const electronRadius = 4;
        const electronColor = '#2196F3';
        ctx.fillStyle = electronColor;

        const electronsPerShell = Math.ceil(electrons / shells);
        let electronCount = 0;

        for (let shell = 1; shell <= shells && electronCount < electrons; shell++) {
            const shellRadius = size * (0.5 + shell * 0.3);
            const electronsInThisShell = Math.min(electronsPerShell, electrons - electronCount);

            for (let e = 0; e < electronsInThisShell; e++) {
                const angle = (e / electronsInThisShell) * Math.PI * 2 +
                    (animation === 'orbit' ? progress * Math.PI * 2 : 0);
                const ex = x + Math.cos(angle) * shellRadius;
                const ey = y + Math.sin(angle) * shellRadius;

                // Electron glow (larger semi-transparent circle)
                const glowGradient = ctx.createRadialGradient(ex, ey, 0, ex, ey, electronRadius * 3);
                glowGradient.addColorStop(0, 'rgba(33, 150, 243, 0.6)');
                glowGradient.addColorStop(1, 'rgba(33, 150, 243, 0)');
                ctx.fillStyle = glowGradient;
                ctx.beginPath();
                ctx.arc(ex, ey, electronRadius * 3, 0, Math.PI * 2);
                ctx.fill();

                // Electron body with gradient
                const electronGradient = ctx.createRadialGradient(ex - 1, ey - 1, 0, ex, ey, electronRadius);
                electronGradient.addColorStop(0, '#FFFFFF');
                electronGradient.addColorStop(0.7, electronColor);
                electronGradient.addColorStop(1, this.darkenColor(electronColor, 0.3));
                ctx.fillStyle = electronGradient;
                ctx.beginPath();
                ctx.arc(ex, ey, electronRadius, 0, Math.PI * 2);
                ctx.fill();

                electronCount++;
            }
        }

        // Element label with background for visibility
        if (element !== 'generic') {
            ctx.save();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            const metrics = ctx.measureText(element);
            ctx.fillRect(x - metrics.width / 2 - 2, y + size + 10, metrics.width + 4, 18);
            ctx.fillStyle = '#000';
            ctx.fillText(element, x, y + size + 22);
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

/**
 * Electron Actor
 * Individual electron particle
 */
export class Electron {
    static draw(ctx, actor, progress, animation) {
        const x = actor.x;
        const y = actor.y;
        const size = actor.size || 5;
        const color = actor.color || '#2196F3';

        ctx.save();

        // Global shadow for depth
        ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        // Orbit animation
        if (animation === 'orbit') {
            const orbitRadius = actor.orbitRadius || 50;
            const angle = progress * Math.PI * 2;
            const orbitX = Math.cos(angle) * orbitRadius;
            const orbitY = Math.sin(angle) * orbitRadius;
            ctx.translate(orbitX, orbitY);
        }

        // Draw electron
        const gradient = ctx.createRadialGradient(x - size * 0.3, y - size * 0.3, 0, x, y, size);
        gradient.addColorStop(0, '#FFFFFF'); // Bright center
        gradient.addColorStop(0.5, color);
        gradient.addColorStop(1, this.darkenColor(color, 0.4)); // Darker edge

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();

        // Electron highlight (small shine)
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.beginPath();
        ctx.arc(x - size * 0.2, y - size * 0.2, size * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Enhanced glow effect
        const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
        glowGradient.addColorStop(0, `rgba(33, 150, 243, 0.6)`);
        glowGradient.addColorStop(1, 'rgba(33, 150, 243, 0)');
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(x, y, size * 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
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

/**
 * Proton Actor
 * Individual proton particle
 */
export class Proton {
    static draw(ctx, actor, progress, animation) {
        const x = actor.x;
        const y = actor.y;
        const size = actor.size || 8;
        const protonColor = '#E53935';

        ctx.save();

        // Global shadow for depth
        ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        // Draw proton
        const gradient = ctx.createRadialGradient(
            x - size * 0.3,
            y - size * 0.3,
            0,
            x,
            y,
            size
        );
        gradient.addColorStop(0, this.lightenColor(protonColor, 0.4)); // Brighter center
        gradient.addColorStop(0.5, protonColor);
        gradient.addColorStop(1, '#C62828'); // Darker edge

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();

        // Proton highlight
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.beginPath();
        ctx.arc(x - size * 0.2, y - size * 0.2, size * 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Plus sign with glow
        ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
        ctx.shadowBlur = 2;
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('+', x, y);
        ctx.shadowBlur = 0;

        // Pulse animation with scale and glow
        if (animation === 'pulse') {
            const pulseScale = 1 + Math.sin(progress * Math.PI * 4) * 0.2;
            const pulseAlpha = 0.5 + Math.sin(progress * Math.PI * 4) * 0.3;
            ctx.save();
            ctx.translate(x, y);
            ctx.scale(pulseScale, pulseScale);
            ctx.translate(-x, -y);

            // Pulse glow
            const pulseGlow = ctx.createRadialGradient(x, y, 0, x, y, size * 2);
            pulseGlow.addColorStop(0, `rgba(229, 57, 53, ${pulseAlpha})`);
            pulseGlow.addColorStop(1, 'rgba(229, 57, 53, 0)');
            ctx.fillStyle = pulseGlow;
            ctx.beginPath();
            ctx.arc(x, y, size * 2, 0, Math.PI * 2);
            ctx.fill();
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
}

/**
 * Neutron Actor
 * Individual neutron particle
 */
export class Neutron {
    static draw(ctx, actor, progress, animation) {
        const x = actor.x;
        const y = actor.y;
        const size = actor.size || 8;
        const neutronColor = '#9E9E9E';

        ctx.save();

        // Global shadow for depth
        ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        // Draw neutron
        const gradient = ctx.createRadialGradient(
            x - size * 0.3,
            y - size * 0.3,
            0,
            x,
            y,
            size
        );
        gradient.addColorStop(0, this.lightenColor(neutronColor, 0.4)); // Brighter center
        gradient.addColorStop(0.5, neutronColor);
        gradient.addColorStop(1, '#424242'); // Darker edge

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();

        // Neutron highlight
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        ctx.beginPath();
        ctx.arc(x - size * 0.2, y - size * 0.2, size * 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Neutral symbol with subtle glow
        ctx.shadowColor = "rgba(255, 255, 255, 0.6)";
        ctx.shadowBlur = 1;
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('n', x, y);
        ctx.shadowBlur = 0;

        // Pulse animation with scale and glow
        if (animation === 'pulse') {
            const pulseScale = 1 + Math.sin(progress * Math.PI * 4) * 0.2;
            const pulseAlpha = 0.3 + Math.sin(progress * Math.PI * 4) * 0.2;
            ctx.save();
            ctx.translate(x, y);
            ctx.scale(pulseScale, pulseScale);
            ctx.translate(-x, -y);

            // Pulse glow
            const pulseGlow = ctx.createRadialGradient(x, y, 0, x, y, size * 2);
            pulseGlow.addColorStop(0, `rgba(158, 158, 158, ${pulseAlpha})`);
            pulseGlow.addColorStop(1, 'rgba(158, 158, 158, 0)');
            ctx.fillStyle = pulseGlow;
            ctx.beginPath();
            ctx.arc(x, y, size * 2, 0, Math.PI * 2);
            ctx.fill();
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
}