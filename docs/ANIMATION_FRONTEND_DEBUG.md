# Animation Frontend Debug Checklist

## Enable debug logs
- Set env: `EXPO_PUBLIC_ANIMATION_DEBUG=1`
- Restart Metro.

## What should be visible
- Label-only scenes render as readable slide cards.
- Unsupported actor types render fallback placeholders (never blank/crash).
- Scene jumps (`tap thumbnail`) seek correctly.
- Play/Pause does not reset unexpectedly.

## Runtime checks
- Current scene index changes with timeline progression.
- Actors with timeline alpha fade correctly.
- Missing `x/y` values use default positions.
- Missing `scenes` or empty `actors` still show fallback visuals.

## Test cases
1. Rich script with sun/plant/arrow/molecule actors.
2. Minimal script containing only black `label` actors.
3. Script with unsupported actor type (`type: "unknown_thing"`).
4. Script with unsupported animation (`animation: "moveUpFast"`).
5. Script with malformed scene timing (`startTime` missing, `duration` missing).

## Expected behavior
- No runtime crash.
- No blank scene.
- Deterministic rendering for same input JSON.
