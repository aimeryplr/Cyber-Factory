import Ressource from "../Entities/ressource";
import GridEntity from "./gridEntity";

class Crafter extends GridEntity {
    //Settings
    speed: number;
    maxCapacity: number;

    constructor(name: String, position: Vector3, speed: number, maxCapacity: number) {
        super(name, position);
        this.speed = speed;
        this.maxCapacity = maxCapacity;
    }

    tick(): void {
        return;
    }
}