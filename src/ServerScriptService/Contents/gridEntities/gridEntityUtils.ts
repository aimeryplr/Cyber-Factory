import Assembler from "./assembler";
import Conveyer from "./conveyer";
import Crafter from "./crafter";
import gridEntitiesList from "./gridEntitiesList";
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

/**
 * find the class in the gridTileClass
 * @param className category name of the class
 * @param args argument of the constructor
 * @returns the class created
 */
function getClassByName(className: string, ...args: unknown[]): GridEntity {
    const ClassConstructor = gridTileClasses[className];
    if (ClassConstructor) {
        return new ClassConstructor(...args);
    } else {
        error(`Class ${className} not found`);
    }
}

/**
 * find the object information in the gridEntities list
 * @param name grridEntity name like generator_t1
 * @returns all the information of the gridEntity
 */
function getGridEntityInformation(name: string, category?: string): {name: string, category: string, tier: number, price: number, speed?: number} {
    let gridEntity;

    if (category) {
        gridEntity = gridEntitiesList.get(category)?.get(name);
        if (!gridEntity) {
            error(`gridEntity ${name} not found`);
        }
    } else {
        for (const [_, _gridEntity] of gridEntitiesList) {
            gridEntity = _gridEntity.get(name);
            if (gridEntity) {
                return gridEntity;
            }
        }
    }
    error(`gridEntity ${name} not found`);
}

/**
 * find the part in the entities folder in the replicated storage
 * @param name part name
 * @returns the part found or error
 */
function findBasepartByName(name: string, category: string): BasePart {
    const part = ReplicatedStorage.FindFirstChild("Entities")?.FindFirstChild("GridEntities")?.FindFirstChild(category)?.FindFirstChild(name) as BasePart;
    if (part !== undefined) return part;
    error(`Part ${name} not found`);
}

export {getClassByName, getGridEntityInformation, findBasepartByName};