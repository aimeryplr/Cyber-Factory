import Assembler from "./assembler";
import Conveyer from "./conveyer";
import Crafter from "./crafter";
import gridEntitiesList from "./gridEntitiesList";
import GridTile from "./gridTile";
import Splitter from "./splitter";
import Generator from "./generator";
import Seller from "./seller";
import { ReplicatedStorage } from "@rbxts/services";
import GridEntity from "./gridEntity";

const gridTileClasses: { [key: string]: new (...args: any[]) => any } = {
    "conveyer": Conveyer,
    "splitter": Splitter,
    "crafter" : Crafter,
    "assembler" : Assembler,
    "generator" : Generator,
    "seller" : Seller
};

function getClassByName(className: string, ...args: unknown[]): GridEntity {
    const ClassConstructor = gridTileClasses[className];
    if (ClassConstructor) {
        return new ClassConstructor(...args);
    } else {
        error(`Class ${className} not found`);
    }
}

function getGridEntityInformation(name: string, category?: string): {name: string, category: string, tier: number, price: number, speed?: number} | undefined {
    let gridEntity;

    if (category) {
        return gridEntitiesList.get(category)?.get(name);
    } else {
        for (const [_, _gridEntity] of gridEntitiesList) {
            gridEntity = _gridEntity.get(name);
            if (gridEntity) {
                return gridEntity;
            }
        }
    }
}

function findBasepartByName(name: string, category: string): BasePart | undefined {
    return ReplicatedStorage.FindFirstChild("Entities")?.FindFirstChild("GridEntities")?.FindFirstChild(category)?.FindFirstChild(name) as BasePart;
}

export {getClassByName, getGridEntityInformation, findBasepartByName};