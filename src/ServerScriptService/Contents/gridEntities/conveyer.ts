import GridEntity from "./gridEntity";

class Conveyer extends GridEntity {
    speed: number;
    direction: Vector2;

    constructor(name: String, position: Vector3, speed: number, direction: Vector2) {
        super(name, position);
        this.speed = speed;
        this.direction = direction;
    }

    tick(): void {
        return;
    }
}