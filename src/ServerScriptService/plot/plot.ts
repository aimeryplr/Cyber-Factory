import { Players, ReplicatedStorage, Workspace } from "@rbxts/services";
import { setupObject } from "ReplicatedStorage/Scripts/placementHandler";
import Conveyer from "ServerScriptService/Contents/gridEntities/tileEntitiesInterface/conveyer";
import { appendInputTiles } from "ServerScriptService/Contents/gridEntities/conveyerUtils";
import { TileEntity } from "ServerScriptService/Contents/gridEntities/tileEntity";
import Tile from "ServerScriptService/Contents/gridEntities/tile";
import { findBasepartByName } from "ServerScriptService/Contents/gridEntities/tileEntityUtils";
import Seller from "ServerScriptService/Contents/gridEntities/tileEntitiesInterface/seller";
import TileGrid from "./gridTile";

const setConveyerBeamsEvent = ReplicatedStorage.WaitForChild("Events").WaitForChild("setConveyerBeams") as RemoteEvent;


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
	public update(): void {
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
				currentTile.tick(currentTile);

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
		this.tileGrid.addTile(tile);
		if (tile instanceof TileEntity) {
			tile.setAllNeighbourTypeConveyer(this.tileGrid);
			tile.setAllConnectedNeighboursTileEntity(this.tileGrid);

			if (tile instanceof Seller) {
				this.sellers.push(tile);
				if (player !== undefined) tile.setOwner(player);
			}

			this.changeShapes(tile, this.gridBase);
			this.resetBeamsOffset();
		}
		return tile;
	}

	changeShapes(tile: TileEntity, gridBase: BasePart) {
		tile.updateShape(gridBase);
		tile.inputTiles.forEach((inputTile) => {
			inputTile.updateShape(gridBase);
		});

		tile.outputTiles.forEach((outputTile) => {
			outputTile.updateShape(gridBase);
		});
	}

	public removeGridTile(tileObj: BasePart): void {
		const localPosition = tileObj.Position.sub(this.gridBase.Position);
		const tile = this.tileGrid.getTileFromPosition(localPosition);

		if (tile === undefined) error("Tile not found when removing it");


		if (tile instanceof TileEntity) {
			this.removeConectedTiles(tile);
			tile.setAllNeighbourTypeConveyer(this.tileGrid);
			this.resetBeamsOffset();
			this.changeShapes(tile as TileEntity, this.gridBase);

			if (tile instanceof Seller) {
				this.sellers.remove(this.sellers.indexOf(tile));
			}
		}


		this.tileGrid.removeTile(tile);
	}

	removeConectedTiles(tileEntity: TileEntity) {
		tileEntity.inputTiles.forEach((inputTile) => {
			inputTile.outputTiles.remove(inputTile.outputTiles.indexOf(tileEntity));
		});

		tileEntity.outputTiles.forEach((outputTiles) => {
			outputTiles.inputTiles.remove(outputTiles.inputTiles.indexOf(tileEntity));
		});
	}

	public getGridTiles(): TileGrid {
		return this.tileGrid;
	}

	/**
	 * reset the animation for all conveyer.
	 * Must use when adding a new conveyer to sync it with the rest
	 */
	public resetBeamsOffset(): void {
		const beams = new Array<Beam>();
		this.gridBase.FindFirstChild("PlacedObjects")?.GetChildren().forEach((child) => {
			child.GetChildren().forEach((part) => {
				if (part.IsA("Beam")) {
					beams.push(part as Beam);
				}
			});
		})
		Players.GetPlayers().forEach((player) => {
			setConveyerBeamsEvent.FireClient(player, beams);
		});
	}
}

export default Plot;