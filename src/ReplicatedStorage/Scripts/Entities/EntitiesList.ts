import { Entity, EntityType } from "./entity";

const entitiesList: Map<string, Entity> = new Map([
    ["Carbon", {
        name: "Carbon",
        type: EntityType.RESOURCE,
        price: 5,
        speed: 60,
        tier: 1,
        img: "137293900370769"
    }],
    ["Copper", {
        name: "Copper",
        type: EntityType.RESOURCE,
        price: 7.5,
        speed: 40,
        tier: 1,
        img: "118964977749377"
    }],
    ["Polymer", {
        name: "Polymer",
        type: EntityType.RESOURCE,
        price: 10,
        speed: 30,
        tier: 1,
        img: "77850599598548"
    }],
    ["Nanotube", {
        name: "Nanotube",
        type: EntityType.COMPONENT,
        price: 25,
        speed: 60,
        tier: 1,
        amount: 2,
        buildRessources: new Map([["Carbon", 1]]),
        img: "93982287992083"
    }],
    ["Copper Wire", {
        name: "Copper Wire",
        type: EntityType.COMPONENT,
        price: 75,
        speed: 40,
        tier: 1,
        amount: 1,
        buildRessources: new Map([["Copper", 1]]),
        img: ""
    }],
    ["Polymer Plate", {
        name: "Polymer Plate",
        type: EntityType.COMPONENT,
        price: 200,
        speed: 7.5,
        tier: 1,
        amount: 1,
        buildRessources: new Map([["Polymer", 2]]),
        img: "139500645180609"
    }],
    ["Transistor", {
        name: "Transistor",
        type: EntityType.MODULE,
        price: 1000,
        speed: 60,
        tier: 2,
        amount: 1,
        buildRessources: new Map([["Carbon", 1], ["Copper Wire", 1]]),
        img: "78163969660914"
    }]
]);

export { entitiesList };