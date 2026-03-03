/**
 * Cell Actor
 * Draws biological cell structures
 */
import { applyEasing } from '../../utils/easing';

export class Cell {
    static draw(ctx, actor, progress, animation) {
        const x = actor.x;
        const y = actor.y;
        const size = actor.size || 60;
        const cellType = actor.cellType || 'animal'; // animal, plant, bacteria
        const showLabels = actor.showLabels !== false;

        ctx.save();

        // Global shadow for depth
        ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        // Appear animation
        if (animation === 'appear') {
            const scale = applyEasing(progress, 'easeOut');
            ctx.translate(x, y);
            ctx.scale(scale, scale);
            ctx.translate(-x, -y);
        }

        // Pulse animation (simulate living cell)
        if (animation === 'pulse') {
            const pulseScale = 1 + Math.sin(progress * Math.PI * 4) * 0.05;
            ctx.translate(x, y);
            ctx.scale(pulseScale, pulseScale);
            ctx.translate(-x, -y);
        }

        // Draw based on cell type
        switch (cellType) {
            case 'animal':
                this.drawAnimalCell(ctx, x, y, size, showLabels);
                break;
            case 'plant':
                this.drawPlantCell(ctx, x, y, size, showLabels);
                break;
            case 'bacteria':
                this.drawBacteria(ctx, x, y, size, showLabels);
                break;
            default:
                this.drawAnimalCell(ctx, x, y, size, showLabels);
        }

        // Reset shadow
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Pulse glow effect
        if (animation === 'pulse') {
            const pulseAlpha = 0.3 + Math.sin(progress * Math.PI * 4) * 0.2;
            ctx.strokeStyle = `rgba(255, 255, 255, ${pulseAlpha})`;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(x, y, size + 2, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Divide animation (enhanced with two offset cells for split effect)
        if (animation === 'divide') {
            const divideProgress = applyEasing(progress, 'easeInOut');
            const offset = divideProgress * 30;

            // Draw dividing line
            ctx.save();
            ctx.strokeStyle = 'rgba(100, 100, 100, 0.5)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]); // Dashed line for division
            ctx.beginPath();
            ctx.moveTo(x, y - size);
            ctx.lineTo(x, y + size);
            ctx.stroke();
            ctx.setLineDash([]); // Reset dash
            ctx.restore();

            // Draw two splitting cells
            ctx.save();
            ctx.translate(-offset, 0);
            switch (cellType) {
                case 'animal':
                    this.drawAnimalCell(ctx, x, y, size, showLabels);
                    break;
                case 'plant':
                    this.drawPlantCell(ctx, x, y, size, showLabels);
                    break;
                case 'bacteria':
                    this.drawBacteria(ctx, x, y, size, showLabels);
                    break;
                default:
                    this.drawAnimalCell(ctx, x, y, size, showLabels);
            }
            ctx.restore();

            ctx.save();
            ctx.translate(offset, 0);
            switch (cellType) {
                case 'animal':
                    this.drawAnimalCell(ctx, x, y, size, showLabels);
                    break;
                case 'plant':
                    this.drawPlantCell(ctx, x, y, size, showLabels);
                    break;
                case 'bacteria':
                    this.drawBacteria(ctx, x, y, size, showLabels);
                    break;
                default:
                    this.drawAnimalCell(ctx, x, y, size, showLabels);
            }
            ctx.restore();
        }

        ctx.restore();
    }

    static drawAnimalCell(ctx, x, y, size, showLabels) {
        // Cell membrane (outer) with enhanced radial gradient
        const membraneGradient = ctx.createRadialGradient(x, y, 0, x, y, size);
        membraneGradient.addColorStop(0, 'rgba(255, 200, 200, 0.4)'); // Lighter center
        membraneGradient.addColorStop(0.7, 'rgba(255, 150, 150, 0.6)');
        membraneGradient.addColorStop(1, 'rgba(200, 100, 100, 0.9)'); // Darker edge

        ctx.fillStyle = membraneGradient;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();

        // Membrane stroke with glow
        ctx.shadowColor = "rgba(211, 47, 47, 0.5)";
        ctx.shadowBlur = 3;
        ctx.strokeStyle = '#D32F2F';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Cytoplasm with subtle gradient
        const cytoGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 0.9);
        cytoGradient.addColorStop(0, 'rgba(255, 220, 220, 0.5)');
        cytoGradient.addColorStop(1, 'rgba(255, 220, 220, 0.3)');
        ctx.fillStyle = cytoGradient;
        ctx.beginPath();
        ctx.arc(x, y, size * 0.9, 0, Math.PI * 2);
        ctx.fill();

        // Nucleus with radial gradient
        const nucleusGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 0.4);
        nucleusGradient.addColorStop(0, '#A239D1'); // Lighter center
        nucleusGradient.addColorStop(1, '#8E24AA'); // Darker edge
        ctx.fillStyle = nucleusGradient;
        ctx.beginPath();
        ctx.arc(x, y, size * 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Nucleus highlight
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.beginPath();
        ctx.arc(x - size * 0.1, y - size * 0.1, size * 0.15, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#6A1B9A';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Nucleolus (inside nucleus) with gradient
        const nucleolusGradient = ctx.createRadialGradient(x - size * 0.1, y - size * 0.1, 0, x - size * 0.1, y - size * 0.1, size * 0.15);
        nucleolusGradient.addColorStop(0, '#5E35B1');
        nucleolusGradient.addColorStop(1, '#4A148C');
        ctx.fillStyle = nucleolusGradient;
        ctx.beginPath();
        ctx.arc(x - size * 0.1, y - size * 0.1, size * 0.15, 0, Math.PI * 2);
        ctx.fill();

        // Mitochondria with gradients and highlights
        const mitoColor = '#F57C00';
        const mitoPositions = [
            [x + size * 0.5, y - size * 0.3],
            [x - size * 0.6, y + size * 0.2],
            [x + size * 0.3, y + size * 0.5]
        ];

        mitoPositions.forEach(([mx, my]) => {
            // Mito gradient
            const mitoGradient = ctx.createLinearGradient(mx - size * 0.15, my, mx + size * 0.15, my);
            mitoGradient.addColorStop(0, this.lightenColor(mitoColor, 0.3));
            mitoGradient.addColorStop(1, this.darkenColor(mitoColor, 0.2));
            ctx.fillStyle = mitoGradient;
            ctx.strokeStyle = '#E65100';
            ctx.lineWidth = 1;

            ctx.beginPath();
            ctx.ellipse(mx, my, size * 0.15, size * 0.08, 0.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Mito highlight
            ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
            ctx.beginPath();
            ctx.ellipse(mx - size * 0.05, my - size * 0.02, size * 0.1, size * 0.05, 0.5, 0, Math.PI * 2);
            ctx.fill();
        });

        // Ribosomes (small dots) with subtle glow
        const riboColor = '#1976D2';
        ctx.shadowColor = "rgba(25, 118, 210, 0.5)";
        ctx.shadowBlur = 1;
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const dist = size * 0.7;
            const rx = x + Math.cos(angle) * dist;
            const ry = y + Math.sin(angle) * dist;
            ctx.fillStyle = riboColor;
            ctx.beginPath();
            ctx.arc(rx, ry, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.shadowBlur = 0;

        if (showLabels) {
            this.drawLabel(ctx, 'Nucleus', x, y - size * 0.6, '#000');
        }
    }

    static drawPlantCell(ctx, x, y, size, showLabels) {
        // Cell wall (rectangular) with gradient fill
        const wallGradient = ctx.createLinearGradient(x - size, y - size, x + size, y + size);
        wallGradient.addColorStop(0, 'rgba(200, 255, 200, 0.4)');
        wallGradient.addColorStop(1, 'rgba(150, 255, 150, 0.2)');
        ctx.fillStyle = wallGradient;
        ctx.strokeStyle = '#558B2F';
        ctx.lineWidth = 3;
        ctx.fillRect(x - size, y - size, size * 2, size * 2);
        ctx.strokeRect(x - size, y - size, size * 2, size * 2);

        // Cell wall highlight
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        ctx.fillRect(x - size + 2, y - size + 2, size * 2 * 0.5, size * 2 * 0.5);

        // Cell membrane (inside wall) with subtle stroke
        ctx.strokeStyle = '#689F38';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x - size * 0.9, y - size * 0.9, size * 1.8, size * 1.8);

        // Chloroplasts (green ovals) with gradients
        const chloroColor = '#4CAF50';
        const chloroPositions = [
            [x - size * 0.5, y - size * 0.5],
            [x + size * 0.5, y - size * 0.5],
            [x - size * 0.5, y + size * 0.5],
            [x + size * 0.5, y + size * 0.5]
        ];

        chloroPositions.forEach(([cx, cy]) => {
            // Chloro gradient
            const chloroGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.2);
            chloroGradient.addColorStop(0, this.lightenColor(chloroColor, 0.4));
            chloroGradient.addColorStop(1, this.darkenColor(chloroColor, 0.2));
            ctx.fillStyle = chloroGradient;
            ctx.strokeStyle = '#2E7D32';
            ctx.lineWidth = 1;

            ctx.beginPath();
            ctx.ellipse(cx, cy, size * 0.2, size * 0.15, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Chloro highlight
            ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
            ctx.beginPath();
            ctx.ellipse(cx - size * 0.05, cy - size * 0.03, size * 0.1, size * 0.08, 0, 0, Math.PI * 2);
            ctx.fill();
        });

        // Central vacuole with gradient
        const vacGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 0.5);
        vacGradient.addColorStop(0, 'rgba(100, 200, 255, 0.4)');
        vacGradient.addColorStop(1, 'rgba(100, 200, 255, 0.2)');
        ctx.fillStyle = vacGradient;
        ctx.strokeStyle = '#0288D1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Vacuole highlight
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        ctx.beginPath();
        ctx.arc(x - size * 0.15, y - size * 0.15, size * 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Nucleus with gradient
        const nucleusGradient = ctx.createRadialGradient(x - size * 0.4, y - size * 0.3, 0, x - size * 0.4, y - size * 0.3, size * 0.25);
        nucleusGradient.addColorStop(0, '#A239D1');
        nucleusGradient.addColorStop(1, '#8E24AA');
        ctx.fillStyle = nucleusGradient;
        ctx.beginPath();
        ctx.arc(x - size * 0.4, y - size * 0.3, size * 0.25, 0, Math.PI * 2);
        ctx.fill();

        // Nucleus highlight
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.beginPath();
        ctx.arc(x - size * 0.45, y - size * 0.35, size * 0.1, 0, Math.PI * 2);
        ctx.fill();

        if (showLabels) {
            this.drawLabel(ctx, 'Vacuole', x, y - size * 0.6, '#000');
        }
    }

    static drawBacteria(ctx, x, y, size, showLabels) {
        const bacColor = '#66BB6A';

        // Bacterial cell (rod-shaped) with gradient
        const bodyGradient = ctx.createLinearGradient(x - size * 0.8, y - size * 0.3, x + size * 0.8, y + size * 0.3);
        bodyGradient.addColorStop(0, this.lightenColor(bacColor, 0.3));
        bodyGradient.addColorStop(1, this.darkenColor(bacColor, 0.2));
        ctx.fillStyle = bodyGradient;
        ctx.strokeStyle = '#2E7D32';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(x - size * 0.8, y - size * 0.3);
        ctx.lineTo(x + size * 0.8, y - size * 0.3);
        ctx.quadraticCurveTo(x + size, y - size * 0.3, x + size, y);
        ctx.lineTo(x + size, y + size * 0.3);
        ctx.quadraticCurveTo(x + size, y + size * 0.3, x + size * 0.8, y + size * 0.3);
        ctx.lineTo(x - size * 0.8, y + size * 0.3);
        ctx.quadraticCurveTo(x - size, y + size * 0.3, x - size, y);
        ctx.quadraticCurveTo(x - size, y - size * 0.3, x - size * 0.8, y - size * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Body highlight
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.beginPath();
        ctx.rect(x - size * 0.4, y - size * 0.15, size * 0.8, size * 0.3);
        ctx.fill();

        // Nucleoid (DNA region) with gradient
        const nucleoidGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 0.3);
        nucleoidGradient.addColorStop(0, '#FFB74D');
        nucleoidGradient.addColorStop(1, '#FFA726');
        ctx.fillStyle = nucleoidGradient;
        ctx.beginPath();
        ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Nucleoid highlight
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        ctx.beginPath();
        ctx.arc(x - size * 0.1, y - size * 0.1, size * 0.1, 0, Math.PI * 2);
        ctx.fill();

        // Flagella (tail) with gradient stroke
        const flagellaGradient = ctx.createLinearGradient(x + size, y, x + size * 2, y);
        flagellaGradient.addColorStop(0, bacColor);
        flagellaGradient.addColorStop(1, this.darkenColor(bacColor, 0.4));
        ctx.strokeStyle = flagellaGradient;
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x + size, y);
        for (let i = 0; i < 5; i++) {
            const fx = x + size + i * 10;
            const fy = y + Math.sin(i * Math.PI / 2) * 10;
            if (i === 0) {
                ctx.moveTo(fx, fy);
            } else {
                ctx.lineTo(fx, fy);
            }
        }
        ctx.stroke();

        // Flagella highlight
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + size, y);
        for (let i = 0; i < 5; i++) {
            const fx = x + size + i * 10 - 0.5;
            const fy = y + Math.sin(i * Math.PI / 2) * 10 - 0.5;
            if (i === 0) {
                ctx.moveTo(fx, fy);
            } else {
                ctx.lineTo(fx, fy);
            }
        }
        ctx.stroke();

        if (showLabels) {
            this.drawLabel(ctx, 'DNA', x, y - size * 0.6, '#000');
        }
    }

    // Helper for drawing labels with background for visibility
    static drawLabel(ctx, text, x, y, color) {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        const metrics = ctx.measureText(text);
        ctx.fillRect(x - metrics.width / 2 - 2, y - 12, metrics.width + 4, 12);
        ctx.fillStyle = color;
        ctx.fillText(text, x, y - 2);
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