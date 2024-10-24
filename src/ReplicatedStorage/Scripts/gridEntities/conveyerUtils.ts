import Tile from "./tile";

function appendInputTiles(inputTiles: Array<Tile>, tileToAdd: Array<Tile>) {
    for (const tile of tileToAdd) {
        if (inputTiles.find((inputTile) => inputTile.position === tile.position)) continue;
        inputTiles.push(tile);
    }
}

function moveItemsInArray(contentArray: Array<unknown | undefined>, maxSize: number): void{
    for (let i = 1; i < maxSize; i++) {
        if (contentArray[i - 1] === undefined) {
            contentArray[i - 1] = contentArray[i];
            contentArray[i] = undefined;
        }
    }
}

function transferArrayContent(previousArray: Array<unknown | undefined>, nextArray: Array<unknown | undefined>, nextArraySize: number): Array<unknown | undefined> {
    for (let i = 0; i < previousArray.size(); i++) {
        const lastElementIndex = nextArraySize - 1 - i;
        if (previousArray[i] !== undefined && nextArray[lastElementIndex] === undefined) {
            nextArray[lastElementIndex] = previousArray[i];
            previousArray[i] = undefined;
        }
    }
    return previousArray;
}

function addBackContent(previousArray: Array<unknown | undefined>, nextArray: Array<unknown | undefined>, nextArraySize: number): Array<unknown | undefined> {
    for (let i = 0; i < previousArray.size(); i++) {
        if (previousArray[i] !== undefined && nextArray[i] === undefined) {
            nextArray[i] = previousArray[i];
        }
    }
    return previousArray;
}

/**
 * transfer the content of the array to the next array on the last index
 * @param range where the content will be transfered
 * @satisfies {range} < {nextArraysSize}
 * @returns the previous array without the content transfered
 */
function transferArrayContentToArrayPart(previousArray: Array<unknown | undefined>, nextArray: Array<unknown | undefined>, range: number, nextArraySize: number): Array<unknown | undefined> {
    for (let i = 0; i < previousArray.size(); i++) {
        for (let k = nextArraySize - 1; k >= nextArraySize - 1 - range; k--) {
            if (nextArray[k] === undefined) {
                nextArray[k] = previousArray[i];
                previousArray[i] = undefined;
                break;
            }
        }
    }
    return previousArray;
}

function copyArray(from: Array<unknown>, to: Array<unknown>): Array<unknown> {
    for (let i = 0; i < from.size(); i++) {
        to[i] = from[i];
    }
    return to;
}
    

function copySegment(array: Array<unknown | undefined>, start: number, finish: number): Array<unknown | undefined> {
    let segment = new Array<unknown | undefined>(finish - start, undefined);
    for (let i = start; i < finish; i++) {
        segment[i] = array[i];
    }

    return segment;
}

/**
 * take [start...end] from array
 * @returns the array removed
 */
function removeSegment(array: Array<unknown | undefined>, start: number, finish: number): Array<unknown | undefined> {
    let removedSegment = new Array<unknown | undefined>(finish - start + 1, undefined);
    for (let i = finish; i >= start; i--) {
        removedSegment[i] = array[i];
        array[i] = undefined;
    }

    return removedSegment;
}

function addSegment(array: Array<unknown | undefined>, segment: Array<unknown | undefined>, start: number): void {
    for (let i = start; i < segment.size(); i++) {
        array[i] = segment[i];
    }
}

function shiftOrder(array: Array<unknown>): void {
    const lastInput = array[array.size() - 1]; // Get the last element
    for (let i = array.size() - 1; i > 0; i--) {
        array[i] = array[i - 1]; // Shift elements to the right
    }
    array[0] = lastInput;
}

export { appendInputTiles, moveItemsInArray, transferArrayContent, copySegment, removeSegment, addSegment, copyArray, transferArrayContentToArrayPart, addBackContent, shiftOrder };