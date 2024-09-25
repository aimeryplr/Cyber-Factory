import { appendInputTiles } from "ServerScriptService/Contents/gridEntities/conveyerUtils";
import { TileEntity } from "ServerScriptService/Contents/gridEntities/tileEntity";
import Tile from "ServerScriptService/Contents/gridEntities/tile";
import Seller from "ServerScriptService/Contents/gridEntities/tileEntitiesChilds/seller";
import TileGrid from "./gridTile";
import { changeShapes, resetBeamsOffset, setAllNeighbourTypeConveyer } from "./plotsUtils";
import { removeAllTileFromAllConnectedTiles } from "ServerScriptService/Contents/gridEntities/tileEntityUtils";


/**
 * holds all classes of the player's plot
 */
class Plot {
	private owner: number | undefined;
	private gridBase: BasePart;

	private tileGrid: TileGrid;
	private sellers = new Array<TileEntity>();

	constructor(gridBase: BasePart) {
		this.gridBase = gridBase;
		this.tileGrid = new TileGrid(TileGrid.localPositionToGridTilePosition(gridBase.Size));
	}

	/**
	 * update all plot's gridEntities by going in the sellers and then through all inputTiles
	 */
	public update(dt: number): void {
		// Initialize inputTiles with the last tiles of each conveyor (A3, B3, C3)
		let inputTiles: Array<TileEntity> = this.sellers;

		// Process the tiles backwards through the conveyors
		while (inputTiles.size() > 0) {
			// Create an array to store the new input tiles for the next round
			let newInputTiles = new Array<TileEntity>;

			// Process each tile in the current inputTiles array
			for (let i = 0; i < inputTiles.size(); i++) {
				let currentTile = inputTiles[i];

				// Process the current tile (calling tick)
				currentTile.tick(dt);

				// If the current tile has an input tile, add it to the newInputTiles array
				if (!currentTile.inputTiles.isEmpty()) {
					appendInputTiles(newInputTiles, currentTile.inputTiles);
				}
			}

			// Update inputTiles for the next loop iteration
			inputTiles = newInputTiles;
		}
	}

	public setOwner(userID: number): void {
		this.owner = userID;
	}


	public getOwner(): number | undefined {
		return this.owner;
	}

	public getGridBase(): BasePart {
		return this.gridBase;
	}

	/** 
	 * adds the tile to the plots tables. proceed to check neighbours of the tile.
	 * @param player must be not null when adding a seller
	 * @returns the gridTile if it has been added
	 */
	public addGridTile(tile: Tile, player?: number,): Tile | undefined {
		let addedTile: Tile = tile
		this.tileGrid.addTile(tile);
		if (addedTile instanceof TileEntity) {
			setAllNeighbourTypeConveyer(addedTile, this.tileGrid);
			const possibleTile: TileEntity = this.tileGrid.getTileFromPosition(tile.position) as TileEntity;
			if (possibleTile !== undefined) addedTile = possibleTile;
			(addedTile as TileEntity).setAllConnectedNeighboursTileEntity(this.tileGrid);

			if (addedTile instanceof Seller) {
				this.sellers.push(addedTile);
				if (player !== undefined) addedTile.setOwner(player);
			}

			changeShapes((addedTile as TileEntity), this.gridBase, this.tileGrid);
			resetBeamsOffset(this.gridBase);
		}
		return addedTile;
	}

	public removeGridTile(tileObj: BasePart): void {
		const localPosition = tileObj.Position.sub(this.gridBase.Position);
		const tile = this.tileGrid.getTileFromPosition(localPosition);

		if (tile === undefined) error("Tile not found when removing it");

		if (tile instanceof TileEntity) {
			this.removeConectedTiles(tile);
			setAllNeighbourTypeConveyer(tile, this.tileGrid);
			resetBeamsOffset(this.gridBase);
			changeShapes(tile as TileEntity, this.gridBase, this.tileGrid);

			if (tile instanceof Seller) {
				this.sellers.remove(this.sellers.indexOf(tile));
			}
		}

		tile.findThisPartInWorld(this.gridBase)?.Destroy();
		this.tileGrid.removeTile(tile);
	}

	removeConectedTiles(tileEntity: TileEntity) {
		removeAllTileFromAllConnectedTiles(tileEntity);
		tileEntity.outputTiles.clear();
		tileEntity.inputTiles.clear();
	}

	public getGridTiles(): TileGrid {
		return this.tileGrid;
	}
}

export default Plot;