import GridEntity from "./gridEntity";

class Assembler extends GridEntity {
    speed: number;

    constructor(speed: number) {
        super()
        this.speed = speed;
    }

    tick(): void {
        return;
    }
}