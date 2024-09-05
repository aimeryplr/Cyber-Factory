import GridEntity from "./gridEntity";

class Conveyer extends GridEntity {
    speed: number;
    direction: Vector2;

    constructor(speed: number, direction: Vector2) {
        super()
        this.speed = speed;
        this.direction = direction;
    }

    tick(): void {
        return;
    }
}