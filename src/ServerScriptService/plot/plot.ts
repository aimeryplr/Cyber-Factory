import { Players, ReplicatedStorage, Workspace } from "@rbxts/services";
import { setupObject } from "ReplicatedStorage/Scripts/placementHandler";
import Conveyer from "ServerScriptService/Contents/gridEntities/conveyer";
import { appendInputTiles } from "ServerScriptService/Contents/gridEntities/conveyerUtils";
import GridEntity from "ServerScriptService/Contents/gridEntities/gridEntity";
import GridTile from "ServerScriptService/Contents/gridEntities/gridTile";
import { findBasepartByName } from "ServerScriptService/Contents/gridEntities/gridTileUtils";
import Seller from "ServerScriptService/Contents/gridEntities/seller";

const setConveyerBeamsEvent = ReplicatedStorage.WaitForChild("Events").WaitForChild("setConveyerBeams") as RemoteEvent;

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

	public addGridTile(gridTile: GridTile, player: number, obj: BasePart): GridTile | undefined {
		if (gridTile instanceof GridEntity) {
			gridTile.setAllNeighboursOutAndInTileEntity(this.getGridEntities(), Workspace.GetPartsInPart(obj), this.gridBase.Position);

			if (gridTile instanceof Seller) {
				this.sellers.push(gridTile);
				gridTile.setOwner(player);
			}

			if (gridTile instanceof Conveyer) {
				this.resetBeamsOffset();
				this.modifyIfTurningConveyer(gridTile as Conveyer);
			}
			this.gridEntities.push(gridTile);
		} else {
			this.gridTile.push(gridTile);
		}
		return gridTile;
	}

	// to optimize with pooling
	// change the basepart depending if the conveyer is turning
	modifyIfTurningConveyer(conveyer: Conveyer): void {
		if (conveyer.inputTiles.isEmpty() || !(conveyer.inputTiles[0] instanceof Conveyer)) return;
		const isTurningConveyer = math.abs(conveyer.direction.X) !== math.abs(conveyer.inputTiles[0].direction.X);
		if (isTurningConveyer) {
			const gridEntitiesPart = this.gridBase.FindFirstChild("PlacedObjects")?.GetChildren() as Array<BasePart>;
			if (gridEntitiesPart?.isEmpty()) error("No objects found in the plot");
			conveyer.findThisPartInGridEntities(gridEntitiesPart, this.gridBase.Position)?.Destroy();
			print(conveyer.name + "T");
			const turningConveyer = findBasepartByName(conveyer.name + "T",conveyer.category);
			if (turningConveyer) {
				setupObject(turningConveyer, conveyer.position.add(this.gridBase.Position), 0, this.gridBase);
			}
		}
	}

	public getGridTiles(): Array<GridTile> {
		return this.gridTile;
	}

	public getGridEntities(): Array<GridEntity> {
		return this.gridEntities;
	}

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