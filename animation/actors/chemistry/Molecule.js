/**
 * Molecule Actor
 * Draws atomic/molecular structures
 */
import { applyEasing } from '../../utils/easing';

export class Molecule {
    static draw(ctx, actor, progress, animation) {
        const x = actor.x;
        const y = actor.y;
        const type = actor.moleculeType || 'water'; // water, co2, o2, custom
        const size = actor.size || 40;

        ctx.save();

        // Appear animation
        if (animation === 'appear') {
            const scale = applyEasing(progress, 'easeOut');
            ctx.translate(x, y);
            ctx.scale(scale, scale);
            ctx.translate(-x, -y);
        }

        // Rotate animation
        if (animation === 'rotate') {
            ctx.translate(x, y);
            ctx.rotate(progress * Math.PI * 2);
            ctx.translate(-x, -y);
        }

        // Vibrate animation (simulating molecular motion)
        if (animation === 'vibrate') {
            const vibX = Math.sin(progress * Math.PI * 20) * 2;
            const vibY = Math.cos(progress * Math.PI * 20) * 2;
            ctx.translate(vibX, vibY);
        }

        // Draw based on molecule type
        switch (type) {
            case 'water':
                this.drawWater(ctx, x, y, size);
                break;
            case 'co2':
                this.drawCO2(ctx, x, y, size);
                break;
            case 'o2':
                this.drawO2(ctx, x, y, size);
                break;
            case 'dna':
                this.drawDNA(ctx, x, y, size);
                break;
            default:
                this.drawGeneric(ctx, x, y, size);
        }

        ctx.restore();
    }

    static drawWater(ctx, x, y, size) {
        // H2O molecule
        const bondLength = size * 0.6;
        const angle = Math.PI / 6; // 30 degrees

        // Oxygen atom (center, larger, red)
        ctx.fillStyle = '#E53935';
        ctx.beginPath();
        ctx.arc(x, y, size * 0.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Hydrogen atoms (smaller, white)
        const h1x = x - Math.cos(angle) * bondLength;
        const h1y = y - Math.sin(angle) * bondLength;
        const h2x = x + Math.cos(angle) * bondLength;
        const h2y = y - Math.sin(angle) * bondLength;

        // Bonds
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(h1x, h1y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(h2x, h2y);
        ctx.stroke();

        // Hydrogen 1
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(h1x, h1y, size * 0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.stroke();

        // Hydrogen 2
        ctx.beginPath();
        ctx.arc(h2x, h2y, size * 0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Labels
        ctx.fillStyle = '#000';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('O', x, y + 4);
        ctx.fillText('H', h1x, h1y + 4);
        ctx.fillText('H', h2x, h2y + 4);
    }

    static drawCO2(ctx, x, y, size) {
        // CO2 molecule (linear)
        const bondLength = size * 0.7;

        // Carbon atom (center, dark gray)
        ctx.fillStyle = '#424242';
        ctx.beginPath();
        ctx.arc(x, y, size * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Oxygen atoms (red)
        const o1x = x - bondLength;
        const o2x = x + bondLength;

        // Bonds (double bonds)
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y - 3);
        ctx.lineTo(o1x, y - 3);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y + 3);
        ctx.lineTo(o1x, y + 3);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x, y - 3);
        ctx.lineTo(o2x, y - 3);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y + 3);
        ctx.lineTo(o2x, y + 3);
        ctx.stroke();

        // Oxygen 1
        ctx.fillStyle = '#E53935';
        ctx.beginPath();
        ctx.arc(o1x, y, size * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.stroke();

        // Oxygen 2
        ctx.beginPath();
        ctx.arc(o2x, y, size * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Labels
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('C', x, y + 4);
        ctx.fillText('O', o1x, y + 4);
        ctx.fillText('O', o2x, y + 4);
    }

    static drawO2(ctx, x, y, size) {
        // O2 molecule
        const bondLength = size * 0.5;

        const o1x = x - bondLength / 2;
        const o2x = x + bondLength / 2;

        // Double bond
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(o1x, y - 3);
        ctx.lineTo(o2x, y - 3);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(o1x, y + 3);
        ctx.lineTo(o2x, y + 3);
        ctx.stroke();

        // Oxygen atoms
        ctx.fillStyle = '#E53935';
        ctx.beginPath();
        ctx.arc(o1x, y, size * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(o2x, y, size * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Labels
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('O', o1x, y + 4);
        ctx.fillText('O', o2x, y + 4);
    }

    static drawDNA(ctx, x, y, size) {
        // Simplified DNA helix
        const height = size * 2;
        const width = size * 0.8;

        ctx.strokeStyle = '#2196F3';
        ctx.lineWidth = 3;

        // Draw helix strands
        for (let i = 0; i < 10; i++) {
            const t = i / 10;
            const yPos = y - height / 2 + t * height;
            const xOffset = Math.sin(t * Math.PI * 4) * width / 2;

            if (i === 0) {
                ctx.beginPath();
                ctx.moveTo(x + xOffset, yPos);
            } else {
                ctx.lineTo(x + xOffset, yPos);
            }
        }
        ctx.stroke();

        // Second strand
        ctx.strokeStyle = '#F44336';
        for (let i = 0; i < 10; i++) {
            const t = i / 10;
            const yPos = y - height / 2 + t * height;
            const xOffset = -Math.sin(t * Math.PI * 4) * width / 2;

            if (i === 0) {
                ctx.beginPath();
                ctx.moveTo(x + xOffset, yPos);
            } else {
                ctx.lineTo(x + xOffset, yPos);
            }
        }
        ctx.stroke();

        // Base pairs
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
            const t = i / 8;
            const yPos = y - height / 2 + t * height;
            const xOffset1 = Math.sin(t * Math.PI * 4) * width / 2;
            const xOffset2 = -Math.sin(t * Math.PI * 4) * width / 2;

            ctx.beginPath();
            ctx.moveTo(x + xOffset1, yPos);
            ctx.lineTo(x + xOffset2, yPos);
            ctx.stroke();
        }
    }

    static drawGeneric(ctx, x, y, size) {
        // Generic atom representation
        ctx.fillStyle = '#9C27B0';
        ctx.beginPath();
        ctx.arc(x, y, size * 0.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Nucleus
        ctx.fillStyle = '#6A1B9A';
        ctx.beginPath();
        ctx.arc(x, y, size * 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Electrons
        ctx.strokeStyle = '#9C27B0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, size * 0.6, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(x + size * 0.6, y, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}