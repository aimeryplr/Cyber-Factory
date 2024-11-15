import { appendInputTiles } from "ReplicatedStorage/Scripts/gridEntities/conveyerUtils";
import { TileEntity } from "ReplicatedStorage/Scripts/gridEntities/tileEntity";
import Tile from "ReplicatedStorage/Scripts/gridEntities/tile";
import Seller from "ReplicatedStorage/Scripts/gridEntities/tileEntitiesChilds/seller";
import { TileGrid } from "../../ReplicatedStorage/Scripts/gridTile";
import { changeShapes, getMoneyReward, getPlayerFromUserId, resetBeamsOffset } from "./plotsUtils";
import { findBasepartByName, removeConectedTiles } from "ReplicatedStorage/Scripts/gridEntities/tileEntityUtils";
import Conveyor from "ReplicatedStorage/Scripts/gridEntities/tileEntitiesChilds/conveyor";
import { ReplicatedStorage } from "@rbxts/services";
import { setupObject } from "ReplicatedStorage/Scripts/placementHandlerUtils";
import { Quest, Reward, RewardType } from "ReplicatedStorage/Scripts/quest/quest";
import { cloneQuest, resetQuestGoals, updateGoals } from "ReplicatedStorage/Scripts/quest/questUtils";
import { getUnlockedTile, isQuestCompleted, questList, questTreeArray, tierList } from "ReplicatedStorage/Scripts/quest/questList";
import { getQuestFromQuestNodes } from "ReplicatedStorage/Scripts/quest/questTreeUtils";

const destroyConveyerEvent = ReplicatedStorage.WaitForChild("Events").WaitForChild("destroyConveyer") as RemoteEvent;
const setPlayerPlot = ReplicatedStorage.WaitForChild("Events").WaitForChild("setPlayerPlot") as RemoteEvent;
const playerQuestEvent = ReplicatedStorage.WaitForChild("Events").WaitForChild("playerQuests") as RemoteEvent;
const unlockedTileListEvent = ReplicatedStorage.WaitForChild("Events").WaitForChild("unlockedTileList") as RemoteEvent;

/**
 * holds all classes of the player's plot
 */
class Plot {
	private owner: number | undefined;
	private gridBase: BasePart;

	private tileGrid: TileGrid;
	private endingTiles = new Array<TileEntity>();

	private quests: Array<Quest> = new Array<Quest>();

	constructor(gridBase: BasePart) {
		this.gridBase = gridBase;
		this.tileGrid = new TileGrid(TileGrid.localPositionToGridTilePosition(gridBase.Size));
		this.addQuest(questList.get("Beginning of the end")!);
	}

	/**
	 * update all plot's gridEntities by going in the sellers and then through all inputTiles
	*/
	public update(progress: number): void {
		if (!this.owner) return;
		if (this.endingTiles.isEmpty()) return;
		// Initialize inputTiles with the last tiles of each conveyor (A3, B3, C3)
		let inputTiles: Array<TileEntity> = this.endingTiles;

		// Process the tiles backwards through the conveyors
		while (inputTiles.size() > 0) {
			// Create an array to store the new input tiles for the next round
			let newInputTiles = new Array<TileEntity>;

			// Process each tile in the current inputTiles array
			for (let i = 0; i < inputTiles.size(); i++) {
				let currentTile = inputTiles[i];

				// Process the current tile (calling tick)
				for (const child of currentTile.inputTiles) {
					if (child.maxOutputs > 1) {
						// Check if child.outputs is a subset of inputTiles
						const isSubset = child.outputTiles.every(output => inputTiles.includes(output));
						if (!isSubset) {
							appendInputTiles(newInputTiles, [currentTile]);
							continue;
						}
					}

					appendInputTiles(newInputTiles, [child]);
					currentTile.tick(progress);
				}

				if (currentTile.inputTiles.isEmpty()) {
					currentTile.tick(progress);
				}
			}

			// Update inputTiles for the next loop iteration
			inputTiles = newInputTiles;
		}
	}

	updateQuests(entitySoldName: string) {
		for (let i = this.quests.size() - 1; i >= 0; i--) {
			const quest = this.quests[i];
			updateGoals(quest, entitySoldName);
			if (isQuestCompleted(quest)) {
				print(`Quest ${quest.name} completed`);

				this.claimRewards(quest.rewards);
				for (const _quest of questTreeArray[quest.tier - 1].getNextQuests(quest)) {
					this.addQuest(_quest);
				}
				this.quests.remove(i);
				if (this.quests.isEmpty()) {
					this.claimTierReward(quest.tier);
				}
			}
		}
		playerQuestEvent.FireClient(getPlayerFromUserId(this.owner as number), this.quests);
	}

	claimTierReward(tier: number) {
		for (const quest of getQuestFromQuestNodes(questTreeArray[tier].roots)) {
			this.addQuest(quest)
		}
		this.claimRewards(tierList[tier].rewards);
	}

	private claimRewards(rewards: Reward[]) {
		for (const reward of rewards) {
			switch (reward.type) {
				case RewardType.MONEY:
					getMoneyReward(getPlayerFromUserId(this.owner!), reward.amount);
					break;
				case RewardType.TILE:
					unlockedTileListEvent.FireClient(getPlayerFromUserId(this.owner!), getUnlockedTile(this.quests));
					break;
			}
		}
	}

	public setOwner(userID: number | undefined): void {
		this.owner = userID;
	}

	setQuests(quests: Quest[]) {
		this.quests = quests;
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
			tile.setAllConnectedNeighboursTileEntity(this.tileGrid);

			if (tile instanceof Seller && player) {
				tile.setOwner(player)
				tile.setSellingCallBack((entitySoldName: string) => { this.updateQuests(entitySoldName) });
			}

			changeShapes(tile, this.gridBase, this.tileGrid);
			resetBeamsOffset(this.gridBase);

			this.endingTiles = this.tileGrid.getAllEndingTiles()
		}
		return tile;
	}

	public removeGridTile(tileObj: BasePart): Tile | undefined {
		const localPosition = tileObj.Position.sub(this.gridBase.Position);
		const tile = this.tileGrid.getTileFromPosition(localPosition);

		if (tile === undefined) error("Tile not found when removing it");

		if (tile instanceof TileEntity) {
			if (tile instanceof Conveyor && this.owner) destroyConveyerEvent.FireClient(getPlayerFromUserId(this.owner), tile.copy());
			removeConectedTiles(tile);
			resetBeamsOffset(this.gridBase);
			changeShapes(tile as TileEntity, this.gridBase, this.tileGrid);
		}

		tile.findThisPartInWorld(this.gridBase)?.Destroy();
		this.tileGrid.removeTile(tile);
		this.endingTiles = this.tileGrid.getAllEndingTiles()
		return tile
	}

	addOwner(player: Player) {
		if (this.getOwner() === undefined && player !== undefined) {
			this.setOwner(player.UserId);
			setPlayerPlot.FireClient(player, this.getGridBase());
			print(`Player ${player.Name} claimed the plot`);
		}
	}

	addQuest(quest: Quest) {
		const clone = cloneQuest(quest)
		this.quests.push(resetQuestGoals(clone));
	}

	removeOwner() {
		const placedObject = this.gridBase.FindFirstChild("PlacedObject");
		const Entities = this.gridBase.FindFirstChild("Entities");

		if (placedObject) {
			for (const part of placedObject.GetChildren()) {
				part.Destroy();
			}
		}

		if (Entities) {
			for (const part of Entities.GetChildren()) {
				part.Destroy();
			}
		}
	}

	public getQuests() {
		return this.quests;
	}

	public loadGrid(tileGrid: TileGrid): void {
		this.tileGrid.tileGrid = tileGrid.tileGrid;

		this.loadGridBaseparts();
		
		coroutine.wrap(() => {
			for (let i = 0; i < 10; i++) {
				wait(1);
				resetBeamsOffset(this.gridBase);
			}
		})();
	}

	loadGridBaseparts() {
		for (const tile of this.tileGrid.getTiles()) {
			if (!tile) continue;

			if (tile instanceof Conveyor) tile.content = []; // change to spawn immediatly the content

			const basepart = findBasepartByName(tile.name);
			setupObject(basepart, tile.getGlobalPosition(this.gridBase), tile.getOrientation(), this.gridBase);
			if (tile instanceof TileEntity) tile.updateShape(this.gridBase)

			if (tile instanceof Seller) {
				tile.setOwner(this.owner as number)
				tile.setSellingCallBack((entitySoldName: string) => { this.updateQuests(entitySoldName) })
			};

		}
		this.endingTiles = this.tileGrid.getAllEndingTiles()
	}

	reset() {
		this.tileGrid = new TileGrid(TileGrid.localPositionToGridTilePosition(this.gridBase.Size));
		this.gridBase.FindFirstChild("PlacedObjects")!.ClearAllChildren();
		this.gridBase.FindFirstChild("Entities")!.ClearAllChildren();
	}

	public getGridTiles(): TileGrid {
		return this.tileGrid;
	}

	public encode(): any {
		return this.tileGrid.encode();
	}
}

export default Plot;
