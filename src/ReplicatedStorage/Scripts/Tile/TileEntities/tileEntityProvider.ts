import Assembler from "./Machines/assembler";
import Conveyor from "./Machines/conveyor";
import Crafter from "./Machines/crafter";
import tileEntitiesList from "./tileEntitiesList";
import Splitter from "./Machines/splitter";
import Generator from "./Machines/generator";
import Seller from "./Machines/seller";
import { TileEntity } from "./tileEntity";
import Merger from "./Machines/merger";
import { SubConveyer } from "./Machines/subConveyer";
import { ElectricPole } from "./Electricity/ElectricPole";


const tileRegistry: { [key: string]: new (...args: any[]) => any } = {
    "conveyor": Conveyor,
    "splitter": Splitter,
    "crafter": Crafter,
    "assembler": Assembler,
    "generator": Generator,
    "seller": Seller,
    "merger": Merger,
    "subConveyer": SubConveyer,
    "electricPole": ElectricPole,
};

/**
 * find the class in the gridTileClass
 * @param className category name of the class
 * @param args argument of the constructor
 * @returns the class created
 */
function getTileEntityByCategory(className: string, name: string, position: Vector3, size: Vector2, direction: Vector2, speed: number, gridBase: BasePart): TileEntity {
    const ClassConstructor = tileRegistry[className];
    if (ClassConstructor) {
        return new ClassConstructor(name, position, size, direction, speed, gridBase);
    } else {
        error(`Class ${className} not found`);
    }
}

/**
 * find the object information in the gridEntities list, the name can be contained in the name
 * @param name gridEntity name like generator_t1
 * @returns all the information of the gridEntity
 */
function getTileEntityInformation(name: string): { name: string, category: string, tier: number, price: number, speed: number, image: string } {
    const tileEntity = tileEntitiesList.get(name);
    if (tileEntity) return tileEntity;

    for (const [tileName, tile] of tileEntitiesList) {
        if (tileName === name.sub(0, tileName.size())) return tile;
    }
    error(`tileEntity ${name} not found`);
}


export const isInteractable = (category: string): boolean => {
    return ["generator", "crafter", "assembler"].includes(category);
}

export function getAllTilesNames(): string[] {
    const tilesNames: string[] = [];
    for (const [tileName, _] of tileEntitiesList) {
        tilesNames.push(tileName);
    }
    return tilesNames;
}

export { getTileEntityByCategory, getTileEntityInformation };