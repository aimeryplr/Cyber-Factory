import GridEntity from "ServerScriptService/Contents/gridEntities/gridEntity";
import GridTile from "ServerScriptService/Contents/gridEntities/gridTile";
import { getClassByName } from "ServerScriptService/Contents/gridEntities/gridTileUtils";

class Plot {
	private owner: number | undefined;
	private gridBase: BasePart;

    private gridEntities = new Array<GridEntity>();
    private gridTile = new Array<GridTile>();

	constructor(gridBase: BasePart) {
		this.gridBase = gridBase;
		this.owner = undefined;
	}

	public update(): void {
		for (let i = 0; i < this.gridEntities.size(); i++) {
			this.gridEntities[i].tick();
		}
	}

	public setOwner(userID: number) :void {
		this.owner = userID;
	}


	public getOwner(): number | undefined {
		return this.owner;
	}

	public getGridBase(): BasePart {
		return this.gridBase;
	}

	public addGridTile(tileName: string, pos: Vector3): void {
		const gridTile = getClassByName(tileName, pos);
		if (!gridTile) return;
		if (gridTile instanceof GridEntity) {
			this.gridEntities.push(gridTile);
		} else {
			this.gridTile.push(gridTile);
		}
	}

	public getGridTiles(): Array<GridTile> {
		return this.gridTile;
	}

	public getGridEntities(): Array<GridEntity> {
		return this.gridEntities;
	}
}

export default Plot;