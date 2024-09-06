import GridEntity from "./gridEntity";

class Assembler extends GridEntity {
    speed: number;

    constructor(name: String, position: Vector3, speed: number) {
        super(name, position);
        this.speed = speed;
    }

    tick(): void {
        return;
    }
}