# Actor System Architecture

## 🎯 Overview

This directory contains all actor implementations. Each actor is a self-contained module that knows how to draw itself.

## 📁 Structure

```
actors/
├── base/
│   └── Actor.js          # Base class with common functionality
├── astronomy/
│   ├── Planet.js
│   ├── Sun.js
│   ├── Moon.js
│   └── Star.js
├── biology/
│   ├── Plant.js
│   ├── Animal.js
│   ├── Cell.js
│   └── Leaf.js
├── chemistry/
│   ├── Molecule.js
│   ├── Atom.js
│   └── Electron.js
├── earth/
│   ├── Cloud.js
│   ├── Earth.js
│   ├── Mountain.js
│   └── Ocean.js
└── visual/
    ├── Arrow.js
    ├── Label.js
    └── Line.js
```

## 🎨 Actor Interface

Each actor should implement:

```javascript
class MyActor {
  /**
   * Draw the actor
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {Object} actor - Actor data from script
   * @param {number} progress - Animation progress (0 to 1)
   * @param {string} animation - Animation type
   */
  draw(ctx, actor, progress, animation) {
    // Drawing logic here
  }

  /**
   * Get default properties
   */
  static getDefaults() {
    return {
      x: 400,
      y: 300,
      color: '#000000',
      size: 50
    };
  }
}
```

## 🚀 Usage

```javascript
import { Planet } from './astronomy/Planet';
import { Cloud } from './earth/Cloud';

// Register actors
const actors = {
  planet: Planet,
  cloud: Cloud
};

// Use in animation engine
const actorClass = actors[actor.type];
if (actorClass) {
  actorClass.draw(ctx, actor, progress, animation);
}
```

## 📝 Adding New Actors

1. Create file in appropriate directory
2. Implement `draw()` method
3. Export class
4. Register in actor registry
5. Update AI prompt with new actor type

