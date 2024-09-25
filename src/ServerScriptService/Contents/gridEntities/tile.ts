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
}

export default Tile;