import Assembler from "./assembler";
import Conveyer from "./conveyer";
import Crafter from "./crafter";
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

export {getClassByName};