import Tile from "./gridEntities/tile";
import Conveyer from "./gridEntities/tileEntitiesChilds/conveyer";
import Seller from "./gridEntities/tileEntitiesChilds/seller";
import Splitter from "./gridEntities/tileEntitiesChilds/splitter";

function encodeVector3(v: Vector3): {x: number, y: number, z: number} {
    const encodedVector = {
        x: v.X,
        y: v.Y,
        z: v.Z
    }
    return encodedVector;
}

function encodeVector2(v: Vector2): {x: number, y: number} {
    const encodedVector = {
        x: v.X,
        y: v.Y,
    }
    return encodedVector;
}

function encodeArray(array: Array<unknown | undefined>, maxSize: number): { [key: number]: any } {
    const serialized = new Array(maxSize);

    for (let i = 0; i < maxSize; i++) {
        const value = array[i];
        if (value === undefined) {
            serialized[i] = "n"; // Placeholder for undefined/null values
        } else {
            serialized[i] = value;
        }
    };
    return serialized;
}

function decodeArray(array: Array<unknown>): Array<any> {
    const result: Array<unknown> = new Array(array.size());

    for (let i = 0; i < array.size(); i++) {
        if (array[i] === "n") {
            result[i] = undefined; // Restore undefined/null values
        } else {
            result[i] = array[i];
        }
    };

    return result;
}

function decodeVector3(v: {x: number, y: number, z: number}): Vector3 {
    return new Vector3(v.x, v.y, v.z);
}

function decodeVector2(v: {x: number, y: number}): Vector2 {
    return new Vector2(v.x, v.y);
}

function decodeVector3Array(a: Array<{x: number, y: number, z: number}>): Array<unknown> {
    const result = new Array<Vector3>(a.size());
    for (let i = 0; i < a.size(); i++) {
        result[i] = decodeVector3(a[i]);
    }
    return result;
}

export { encodeVector3, encodeVector2, encodeArray, decodeVector3, decodeVector2, decodeArray, decodeVector3Array };