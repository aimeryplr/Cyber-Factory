class GridTile {
    //position local par rapport au plot
    position: Vector3;
    name: String

    constructor(name: String, position: Vector3) {
        this.position = position;
        this.name = name;
    }
}

export default GridTile;