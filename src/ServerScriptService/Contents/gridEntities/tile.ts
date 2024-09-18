class Tile {
    //position local par rapport au plot
    position: Vector3;
    name: String;
    size: Vector2;

    constructor(name: String, position: Vector3, size: Vector2) {
        this.position = position;
        this.name = name;
        this.size = size;
    }
}

export default Tile;