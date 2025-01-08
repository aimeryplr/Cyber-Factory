import Tile from "../../tile";

function appendInputTiles(inputTiles: Array<Tile>, tileToAdd: Array<Tile>) {
    for (const tile of tileToAdd) {
        if (inputTiles.find((inputTile) => inputTile.position === tile.position)) continue;
        inputTiles.push(tile);
    }
}

function moveItemsInArray(contentArray: Array<unknown | undefined>, maxSize: number): void {
    for (let i = 1; i < maxSize; i++) {
        if (contentArray[i - 1] === undefined) {
            contentArray[i - 1] = contentArray[i];
            contentArray[i] = undefined;
        }
    }
}

/**
 * transfer the content of the array to the next array on the last index
 * @param range where the content will be transfered
 * @satisfies {range} < {nextArraysSize}
 * @returns the previous array without the content transfered
 */
export function transferItemToArray(item: unknown, nextArray: Array<unknown | undefined>, range: number, nextArraySize: number): unknown | undefined {
    for (let k = nextArraySize - 1; k >= nextArraySize - 1 - range; k--) {
        if (nextArray[k] === undefined) {
            nextArray[k] = item;
            return;
        }
    }
    return item;
}

function shiftOrder(array: Array<unknown>): void {
    const lastInput = array[array.size() - 1]; // Get the last element
    for (let i = array.size() - 1; i > 0; i--) {
        array[i] = array[i - 1]; // Shift elements to the right
    }
    array[0] = lastInput;
}

export { appendInputTiles, moveItemsInArray, shiftOrder };