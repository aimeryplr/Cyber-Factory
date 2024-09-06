import GridEntity from "ServerScriptService/Contents/gridEntities/gridEntity";
import GridTile from "ServerScriptService/Contents/gridEntities/gridTile";

class Plot {
	private owner: Player | undefined;
	private gridBase: BasePart;

    private gridEntities = new Array<GridEntity>();
    private gridTile = new Array<GridTile>();

	constructor(gridBase: BasePart) {
		this.gridBase = gridBase;
	}

	public update(): void {
		for (let i = 0; i < this.gridEntities.size(); i++) {
			this.gridEntities[i].tick();
		}
	}

	public setPlayer(player: Player) :void {
		this.owner = player;
	}


	public getOwner(): Player | undefined {
		return this.owner;
	}


}

export default Plot;