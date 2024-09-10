import Entity from "../Entities/entity";

// take [start...end] from array
function removeSegment(array: Array<Entity | undefined>, start: number, end:number): Array<Entity | undefined> {
    let removedSegment = new Array<Entity | undefined>(end - start, undefined);
    for (let i = end; i > start; i--) {
        removedSegment[i] = array[i];
        array[i] = undefined;
    }

    return removedSegment;
}

function addSegment(array: Array<Entity | undefined>, segment: Array<Entity | undefined>, start: number): void {
    for (let i = start; i < segment.size(); i++) {
        array[i] = segment[i];
    }
}

export {removeSegment, addSegment};