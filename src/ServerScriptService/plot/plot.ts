import GridEntity from "ServerScriptService/Contents/gridEntities/gridEntity";

class Plot {
	private Owner: Player;
	private GridBase: BasePart;

    private GridEntities = new Array<GridEntity>();
    private GridTile = new Array<GridEntity>();

	constructor(owner: Player, gridBase: BasePart) {
		this.Owner = owner;
		this.GridBase = gridBase;
	}
}
