import Assembler from "./assembler";
import Conveyer from "./conveyer";
import Crafter from "./crafter";
import tileEntitiesList from "./tileEntitiesList";
import Splitter from "./splitter";
import Generator from "./generator";
import Seller from "./seller";
import { ReplicatedStorage } from "@rbxts/services";
import TileEntity from "./tileEntity";
import { GRID_SIZE } from "ReplicatedStorage/Scripts/placementHandler";

const tileEnityClasses: { [key: string]: new (...args: any[]) => any } = {
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
function getClassByName(className: string, name: string, position: Vector3, size: Vector2, direction: Vector2, speed?: number): TileEntity {
    const ClassConstructor = tileEnityClasses[className];
    if (ClassConstructor) {
        return new ClassConstructor(name, position, size, speed, direction);
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
        gridEntity = tileEntitiesList.get(category)?.get(name);
        if (!gridEntity) {
            error(`gridEntity ${name} not found`);
        }
    } else {
        for (const [_, _gridEntity] of tileEntitiesList) {
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
function findBasepartByName(name: string, category?: string): BasePart {
    if (category) {
        const tileObj = ReplicatedStorage.FindFirstChild("Entities")?.FindFirstChild("GridEntities")?.FindFirstChild(category)?.FindFirstChild(name) as BasePart;
        if (!tileObj) {
            error(`gridEntity ${name} not found`);
        }
        return tileObj;
    } else {
        const categories = ReplicatedStorage.FindFirstChild("Entities")?.FindFirstChild("GridEntities")?.GetChildren()
        if (!categories) error(`no categories found`);

        for (const category of categories) {
            const tileObj = category.FindFirstChild(name) as BasePart;
            if (tileObj !== undefined) {
                return tileObj;
            }
        }
    }
    error(`tileObj ${name} not found`);
}

function objSizeToTileSize(size: Vector3 | Vector2) {
    if (size instanceof Vector3) size = new Vector2((size as Vector3).X, (size as Vector3).Z);
    return new Vector2(math.round(size.X / GRID_SIZE), math.round(size.Y / GRID_SIZE));
}

export {getClassByName, getGridEntityInformation, findBasepartByName, objSizeToTileSize};