import Steering from "./steering.js";
import Vector2 from 'phaser/src/math/Vector2'

class Evasion extends Steering {

    constructor (owner, objects, force = 1) {
        super(owner, objects, force);
    }

    calculateImpulse () {
        const searcherDirection = this.owner.body.velocity;
        const target = this.objects[0];
        this.ownerSpeed = this.owner.body.speed;
        this.targetSpeed = target.body.speed;
        const targetDirection = target.body.velocity;
        const toTarget = new Vector2(this.owner.x - target.x, this.owner.y - target.y);
        const relativeHeading = searcherDirection.dot(targetDirection);

        if (toTarget.dot(targetDirection) < 0 || relativeHeading > -0.95)
        {
            const predictTime = toTarget.length() / (this.targetSpeed + this.ownerSpeed);
            toTarget.x += predictTime*targetDirection.x;
            toTarget.y += predictTime*targetDirection.y;
        }

        if (isNaN(toTarget.x))
            return new Vector2(0, 0);
        const x = (Math.abs(toTarget.x) < 1) ? 0 : -Math.sign(toTarget.x)*this.ownerSpeed;
        const y = (Math.abs(toTarget.y) < 1) ? 0 : -Math.sign(toTarget.y)*this.ownerSpeed;
        return new Vector2(-x, -y);

    }
}

export {Evasion};