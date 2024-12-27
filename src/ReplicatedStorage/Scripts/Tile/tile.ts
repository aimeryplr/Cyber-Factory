import { decodeVector2, decodeVector3, encodeVector2, encodeVector3 } from "../Utils/encoding";

export interface EncodedTile {
    name: string,
    position: { x: number, y: number, z: number },
    size: { x: number, y: number },
    direction: { x: number, y: number }
}

class Tile {
    //position local par rapport au plot
    position: Vector3;
    name: string;
    size: Vector2;
    direction: Vector2;
    gridBase: BasePart;

    constructor(name: string, position: Vector3, size: Vector2, direction: Vector2, gridBase: BasePart) {
        this.position = position;
        this.name = name;
        this.size = size;
        this.direction = direction;
        this.gridBase = gridBase;
    }

    findThisPartInWorld(): BasePart | undefined {
        if (!this.gridBase) error("gridBase not defined");

        const gridPart = this.gridBase.FindFirstChild("PlacedObjects")?.GetChildren() as Array<BasePart>;
        const gridBasePosition = this.gridBase.Position;

        for (let i = 0; i < gridPart.size(); i++) {
            if (gridPart[i].Position.X === this.position.X + gridBasePosition.X && gridPart[i].Position.Z === this.position.Z + gridBasePosition.Z) {
                return gridPart[i];
            }
        }
        return undefined;
    }

    getGlobalPosition(gridBase: BasePart): Vector3 {
        return this.position.add(gridBase.Position);
    }

    /**
     * @returns the orientation of the tile in degrees
     */
    getOrientation(): number {
        return -math.deg(math.atan2(this.direction.Y, this.direction.X))
    }

    encode(): EncodedTile {
        return {
            "name": this.name,
            "position": encodeVector3(this.position),
            "size": encodeVector2(this.size),
            "direction": encodeVector2(this.direction)
        }
    }

    static decode(decoded: unknown, gridBase: BasePart): Tile {
        const data = decoded as { name: string, position: { x: number, y: number, z: number }, size: { x: number, y: number }, direction: { x: number, y: number } };
        return new Tile(data.name, decodeVector3(data.position), decodeVector2(data.size), decodeVector2(data.direction), gridBase);
    }
}

export default Tile;