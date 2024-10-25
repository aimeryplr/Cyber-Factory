import Resource from "./resource";
import Entity from "ReplicatedStorage/Scripts/Content/Entities/entity";

/*
    - name : string
    - sellPrice : number
    - buildRessources : Array<Ressource>
    - tier : number
*/
class Component extends Entity {
    public buildRessources: Map<Component | Resource, number>;
    public tier: number;
    public amount: number;

    constructor(name: string, price: number, buildRessources: Map<Component | Resource, number>, tier: number, speed: number, amount: number) {
        super(name, speed, price);
        this.buildRessources = buildRessources;
        this.tier = tier;
        this.amount = amount;
    }

    copy(): Component {
        return new Component(this.name, this.sellPrice, this.buildRessources, this.tier, this.speed, this.amount);
    }
}


export { Component };