import Assembler from "./tileEntitiesChilds/assembler";
import Conveyor from "./tileEntitiesChilds/conveyor";
import Crafter from "./tileEntitiesChilds/crafter";
import tileEntitiesList from "./tileEntitiesList";
import Splitter from "./tileEntitiesChilds/splitter";
import Generator from "./tileEntitiesChilds/generator";
import Seller from "./tileEntitiesChilds/seller";
import { TileEntity } from "./tileEntity";
import Merger from "./tileEntitiesChilds/merger";


const tileEntityRegistry: { [key: string]: new (...args: any[]) => any } = {
    "conveyor": Conveyor,
    "splitter": Splitter,
    "crafter": Crafter,
    "assembler": Assembler,
    "generator": Generator,
    "seller": Seller,
    "merger": Merger
};

/**
 * find the class in the gridTileClass
 * @param className category name of the class
 * @param args argument of the constructor
 * @returns the class created
 */
function getTileEntityByCategory(className: string, name: string, position: Vector3, size: Vector2, direction: Vector2, speed: number): TileEntity {
    const ClassConstructor = tileEntityRegistry[className];
    if (ClassConstructor) {
        return new ClassConstructor(name, position, size, direction, speed);
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


export const isMachine = (category: string): boolean => {
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