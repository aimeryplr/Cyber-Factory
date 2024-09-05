import Ressource from "../Entities/ressource";
import GridEntity from "./gridEntity";

class Crafter extends GridEntity {
    //Settings
    speed: number;
    maxCapacity: number;

    constructor(speed: number, maxCapacity: number) {
        super()
        this.speed = speed;
        this.maxCapacity = maxCapacity;
    }

    tick(): void {
        return;
    }
}