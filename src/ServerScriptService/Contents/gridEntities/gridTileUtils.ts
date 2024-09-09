import Assembler from "./assembler";
import Conveyer from "./conveyer";
import Crafter from "./crafter";
import gridEntitiesList from "./gridEntitiesList";
import GridTile from "./gridTile";
import Splitter from "./splitter";

const gridTileClasses: { [key: string]: new (...args: any[]) => any } = {
    "conveyer": Conveyer,
    "splitter": Splitter,
    "crafter" : Crafter,
    "assembler" : Assembler
};

function getClassByName(className: string, ...args: unknown[]): GridTile | undefined {
    const ClassConstructor = gridTileClasses[className];
    if (ClassConstructor) {
        return new ClassConstructor(className, ...args);
    } else {
        warn(`Class ${className} not found`);
        return undefined;
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

export {getClassByName, getGridEntityInformation};