/**
 * Adventures of Trishu — Modular Game Suite
 * Shared Boundary Physics & 2D Roaming Helpers
 */

export interface RectBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export class BoundaryPhysics {
  /**
   * Clamps an entity position within rectangular bounds.
   */
  public static clamp(x: number, y: number, bounds: RectBounds): { x: number; y: number } {
    return {
      x: Math.max(bounds.minX, Math.min(bounds.maxX, x)),
      y: Math.max(bounds.minY, Math.min(bounds.maxY, y))
    };
  }

  /**
   * Bounces an entity's velocity when hitting boundaries.
   * Modifies x, y, vx, vy in place and returns whether a collision occurred.
   */
  public static bounce(
    entity: { x: number; y: number; vx: number; vy: number },
    bounds: RectBounds,
    restitution: number = 0.8
  ): boolean {
    let bounced = false;

    if (entity.x <= bounds.minX) {
      entity.x = bounds.minX;
      entity.vx = Math.abs(entity.vx) * restitution;
      bounced = true;
    } else if (entity.x >= bounds.maxX) {
      entity.x = bounds.maxX;
      entity.vx = -Math.abs(entity.vx) * restitution;
      bounced = true;
    }

    if (entity.y <= bounds.minY) {
      entity.y = bounds.minY;
      entity.vy = Math.abs(entity.vy) * restitution;
      bounced = true;
    } else if (entity.y >= bounds.maxY) {
      entity.y = bounds.maxY;
      entity.vy = -Math.abs(entity.vy) * restitution;
      bounced = true;
    }

    return bounced;
  }

  /**
   * Picks a smooth random target within the given rectangular bounds.
   */
  public static getRandomTarget(bounds: RectBounds, margin: number = 20): { x: number; y: number } {
    const minX = bounds.minX + margin;
    const maxX = Math.max(minX, bounds.maxX - margin);
    const minY = bounds.minY + margin;
    const maxY = Math.max(minY, bounds.maxY - margin);

    return {
      x: minX + Math.random() * (maxX - minX),
      y: minY + Math.random() * (maxY - minY)
    };
  }

  /**
   * Computes smooth acceleration towards a target coordinate.
   */
  public static seek(
    current: { x: number; y: number; vx: number; vy: number },
    target: { x: number; y: number },
    maxSpeed: number,
    forceStrength: number,
    dt: number
  ): void {
    const dx = target.x - current.x;
    const dy = target.y - current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 2) {
      const desiredVx = (dx / dist) * maxSpeed;
      const desiredVy = (dy / dist) * maxSpeed;
      current.vx += (desiredVx - current.vx) * Math.min(1.0, forceStrength * dt);
      current.vy += (desiredVy - current.vy) * Math.min(1.0, forceStrength * dt);
    }
  }
}
