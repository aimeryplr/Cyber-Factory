import { decodeVector2, decodeVector3 } from "../encoding";

class Tile {
    //position local par rapport au plot
    position: Vector3;
    name: string;
    size: Vector2;

    constructor(name: string, position: Vector3, size: Vector2) {
        this.position = position;
        this.name = name;
        this.size = size;
    }

    findThisPartInWorld(gridBase: BasePart): BasePart | undefined {
        const gridPart = gridBase.FindFirstChild("PlacedObjects")?.GetChildren() as Array<BasePart>;
        const gridBasePosition = gridBase.Position;

        for (let i = 0; i < gridPart.size(); i++) {
            if (gridPart[i].Position.X === this.position.X + gridBasePosition.X && gridPart[i].Position.Z === this.position.Z + gridBasePosition.Z) {
                return gridPart[i];
            }
        }
        return undefined;
    }

    encode(): {} {
        return {
            "name": this.name,
            "position": this.position,
            "size": this.size
        }
    }

    static decode(decoded: unknown): Tile {
        const data = decoded as {name: string, position: {x: number, y: number, z: number}, size: {x: number, y: number}};
        return new Tile(data.name, decodeVector3(data.position), decodeVector2(data.size));
    }
}

export default Tile;