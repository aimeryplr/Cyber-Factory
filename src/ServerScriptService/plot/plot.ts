import GridEntity from "ServerScriptService/Contents/gridEntities/gridEntity";
import GridTile from "ServerScriptService/Contents/gridEntities/gridTile";
import { appendInputTiles, getClassByName, getGridEntityInformation } from "ServerScriptService/Contents/gridEntities/gridTileUtils";
import Seller from "ServerScriptService/Contents/gridEntities/seller";

class Plot {
	private owner: number | undefined;
	private gridBase: BasePart;

    private gridEntities = new Array<GridEntity>();
    private gridTile = new Array<GridTile>();
	private sellers = new Array<Seller>();

	constructor(gridBase: BasePart) {
		this.gridBase = gridBase;
		this.owner = undefined;
	}

	public update(): void {
		// Initialize inputTiles with the last tiles of each conveyor (A3, B3, C3)
		let inputTiles: Array<GridEntity> = this.sellers;

		// Process the tiles backwards through the conveyors
		while (inputTiles.size() > 0) {
			// Create an array to store the new input tiles for the next round
			let newInputTiles = new Array<GridEntity>;

			// Process each tile in the current inputTiles array
			for (let i = 0; i < inputTiles.size(); i++) {
				let currentTile = inputTiles[i];

				// Process the current tile (calling tick)
				currentTile.tick();

				// If the current tile has an input tile, add it to the newInputTiles array
				if (!currentTile.inputTiles.isEmpty()) {
					appendInputTiles(newInputTiles, currentTile.inputTiles);
				}
			}

			// Update inputTiles for the next loop iteration
			inputTiles = newInputTiles;
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

	public addGridTile(tileName: string, pos: Vector3, direction: Vector2): GridTile | undefined {
		const gridTileInformation = getGridEntityInformation(tileName);
		if (!gridTileInformation) return;

		const gridTile = getClassByName(gridTileInformation.category, pos, direction, gridTileInformation.speed);

		if (!gridTile) return;
		if (gridTile instanceof GridEntity) {
			if (gridTile instanceof Seller) this.sellers.push(gridTile);
			this.gridEntities.push(gridTile);
		} else {
			this.gridTile.push(gridTile);
		}
		return gridTile;
	}

	public getGridTiles(): Array<GridTile> {
		return this.gridTile;
	}

	public getGridEntities(): Array<GridEntity> {
		return this.gridEntities;
	}
}

export default Plot;