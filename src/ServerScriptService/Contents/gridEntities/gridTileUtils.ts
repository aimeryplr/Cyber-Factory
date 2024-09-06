import Assembler from "./assembler";
import Conveyer from "./conveyer";
import Crafter from "./crafter";
import Splitter from "./splitter";

const gridTileClasses: { [key: string]: new (...args: any[]) => any } = {
    "conveyer": Conveyer,
    "splitter": Splitter,
    "crafter" : Crafter,
    "assembler" : Assembler
};

function getClassByName(className: string, ...args: any[]): any | undefined {
    const ClassConstructor = gridTileClasses[className];
    if (ClassConstructor) {
        return new ClassConstructor(...args);
    } else {
        warn(`Class ${className} not found`);
        return undefined;
    }
}