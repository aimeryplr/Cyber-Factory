import Assembler from "./tileEntitiesInterface/assembler";
import Conveyer from "./tileEntitiesInterface/conveyer";
import Crafter from "./tileEntitiesInterface/crafter";
import tileEntitiesList from "./tileEntitiesList";
import Splitter from "./tileEntitiesInterface/splitter";
import Generator from "./tileEntitiesInterface/generator";
import Seller from "./tileEntitiesInterface/seller";
import Tile from "./tile";
import { TileEntity } from "./tileEntity";


const tileEntityRegistry: { [key: string]: new (...args: any[]) => any } = {
    "conveyer": Conveyer,
    "splitter": Splitter,
    "crafter": Crafter,
    "assembler": Assembler,
    "generator": Generator,
    "seller": Seller
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
 * find the object information in the gridEntities list
 * @param name grridEntity name like generator_t1
 * @returns all the information of the gridEntity
 */
function getGridEntityInformation(name: string, category?: string): { name: string, category: string, tier: number, price: number, speed?: number } {
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



export { getTileEntityByCategory, getGridEntityInformation };