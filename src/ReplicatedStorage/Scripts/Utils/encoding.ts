export type EncodedVector3 = { x: number, y: number, z: number };
export type EncodedVector2 = { x: number, y: number };

function encodeVector3(v: Vector3): EncodedVector3 {
    const encodedVector = {
        x: v.X,
        y: v.Y,
        z: v.Z
    }
    return encodedVector;
}

function encodeVector2(v: Vector2): EncodedVector2 {
    const encodedVector = {
        x: v.X,
        y: v.Y,
    }
    return encodedVector;
}

export type EncodedArray<T> = Array<T | "n">;

function encodeArray<T>(array: Array<T | undefined>, maxSize: number): EncodedArray<T> {
    const serialized = new Array<T | "n">(maxSize);

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

function decodeArray<T>(array: EncodedArray<T>): Array<T | undefined> {
    const result: Array<T | undefined> = [];

    for (let i = 0; i < array.size(); i++) {
        if (array[i] === "n") {
            result[i] = undefined; // Restore undefined/null values
        } else {
            result[i] = array[i] as T;
        }
    };

    return result;
}

function decodeVector3(v: EncodedVector3): Vector3 {
    return new Vector3(v.x, v.y, v.z);
}

function decodeVector2(v: EncodedVector2): Vector2 {
    return new Vector2(v.x, v.y);
}

function decodeVector3Array(a: Array<EncodedVector3>): Array<unknown> {
    const result = new Array<Vector3>(a.size());
    for (let i = 0; i < a.size(); i++) {
        result[i] = decodeVector3(a[i]);
    }
    return result;
}

export const decodeMap = (map: unknown): Map<unknown, unknown> => {
    const result = new Map<unknown, unknown>();
    for (const [key, value] of map as Map<unknown, unknown>) {
        result.set(key, value);
    }
    return result;
}

export { encodeVector3, encodeVector2, encodeArray, decodeVector3, decodeVector2, decodeArray, decodeVector3Array };