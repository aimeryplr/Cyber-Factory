import GridEntity from "ServerScriptService/Contents/gridEntities/gridEntity";
import GridTile from "ServerScriptService/Contents/gridEntities/gridTile";
import { getClassByName, getGridEntityInformation } from "ServerScriptService/Contents/gridEntities/gridTileUtils";

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

	public addGridTile(tileName: string, pos: Vector3, direction: Vector2): void {
		const gridTileInformation = getGridEntityInformation(tileName);
		if (!gridTileInformation) return;

		const gridTile = getClassByName(gridTileInformation.category, gridTileInformation.name, pos, direction);
		print(gridTile);

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