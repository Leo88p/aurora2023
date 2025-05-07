import Vector2 from 'phaser/src/math/Vector2'
import {StateTableRow, StateTable} from '../ai/behaviour/state';
const eps = 60;
export default class Slime extends Phaser.Physics.Arcade.Sprite{
    constructor(scene, x, y, name, frame) {
        super(scene, x, y, name, frame);
        scene.physics.world.enable(this);
        scene.add.existing(this);
        this.StateTable = new StateTable(this);
        this.StateTable.addState(new StateTableRow('moving', this.hasArrived, 'jumping'));
        this.StateTable.addState(new StateTableRow('jumping', this.hasPath, 'moving'));
        this.StateTable.addState(new StateTableRow('moving', this.checkPursueStart, 'pursuing'));
        this.StateTable.addState(new StateTableRow('pursuing', this.checkPursueEnd, 'moving'));
        this.currentState = 'jumping';
        this.steering = null
        this.waiting = 0
        this.maxWaiting = Phaser.Math.RND.between(3,5) * 24
    }
    update() {
        this.currentState = this.StateTable.getNextState(this.currentState)
        if (this.currentState == "pursuing") {
            if (this.body.speed < 50) {
                this.body.velocity.add(this.steering.calculateImpulse())
            }
            else {
                this.body.velocity.add(this.steering.calculateImpulse()).normalize().scale(this.body.speed)
            }
        }
        else if (this.currentState == "moving") {
            this.selectNextLocation()
        } else if (this.currentState == 'jumping'){
            this.afterArrived()
        }

        this.updateAnimation();
    }
    updateAnimation() {
        const animsController = this.anims;
        if (this.currentState == 'jumping')
        {
            animsController.play(this.animations[1], true);
        } else
        {
            animsController.play(this.animations[0], true);
        }

    }
    hasPath() {
        if (!this.path || this.path.length == 0) {
            return false
        } else {
            if (this.waiting < this.maxWaiting) {
                this.waiting++;
                return false;
            }
            else {
                this.waiting = 0;
                this.maxWaiting = Phaser.Math.RND.between(3,5) * 24;
                return true;
            }
        }
    }
    hasArrived()
    {
        if (this.pointOfInterest === undefined || this.pointOfInterest.distance(this.body.position) < eps) {
            this.body.velocity.x = 0
            this.body.velocity.y = 0
            return true;
        }
        return false;
    }
    afterArrived() {
        this.pointOfInterest = new Vector2( Phaser.Math.RND.between(50, this.scene.physics.world.bounds.width - 50),
                Phaser.Math.RND.between(100, this.scene.physics.world.bounds.height - 50));
        const neededTileX = Math.floor(this.pointOfInterest.x / 32) ;
        const neededTileY = Math.floor(this.pointOfInterest.y / 32) ;
        const currentPositionX =  Math.floor(this.body.x / 32);
        const currentPositionY =  Math.floor(this.body.y / 32);
        const me = this;
        this.scene.finder.findPath(currentPositionX, currentPositionY, neededTileX, neededTileY, function( path ) {
            if (path === null) {
                // console.warn("Slime says: Path was not found, gonna jump!");
                me.path = [];
            } else {
                me.path = path;
                me.nextTile = me.path[0]
                //console.log("Slime says: Path was found, need to go...");
            }
        });
        this.scene.finder.calculate();
    }
    selectNextLocation() {
        if (this.nextTile)
        {
            this.nextLocation = new Vector2(this.nextTile.x * 32, this.nextTile.y * 32);
        } else
        {
            this.nextLocation = this.body.position;
        }
        const deltaX = this.body.position.x - this.nextLocation.x;
        const deltaY = this.body.position.y - this.nextLocation.y;
        const delta = new Vector2(-deltaX, -deltaY).normalize()
        if (this.body.speed < 50) {
            this.body.velocity.add(delta)
        }
        else {
            this.body.velocity.add(delta).normalize().scale(this.body.speed)
        }
        
        if (this.nextLocation.distance(this.body.position) < eps) {
            this.nextTile = this.path.shift();
        }
    }
    checkPursueStart() {
       return this.body.position.distance(this.player.body.position) < 200
    }
    checkPursueEnd() {
        return this.body.position.distance(this.player.body.position) > 350
    }
    setSteering(steering, player) {
        this.steering = steering;
        this.player = player;
    }
}
