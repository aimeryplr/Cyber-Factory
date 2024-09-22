import Entity from "../../Entities/entity";
import { TileEntity, TileEntityInterface } from "../tileEntity";
import { addSegment, copyArray, moveItemsInArray, transferContent } from "../conveyerUtils";
import { findBasepartByName } from "../tileEntityUtils";
import { setupObject } from "ReplicatedStorage/Scripts/placementHandler";
import TileGrid from "ServerScriptService/plot/gridTile";
import Splitter from "./splitter";
import Merger from "./merger";

//Setings
const MAX_CONTENT = 6;
const MAX_INPUTS = 1;
const MAX_OUTPUTS = 1;
const category: string = "conveyer";

class Conveyer implements TileEntityInterface {
    //new array fill with undifined
    content = new Array<Entity | undefined>(MAX_CONTENT, undefined);

    /**
     * move all items on the conveyer
     */
    tick(tileEntity: TileEntity): void {
        // send the item to the next gridEntity
        if (tileEntity.outputTiles[0] !== undefined) {
            addSegment(this.content, tileEntity.outputTiles[0].interface.addEntity(this.content), MAX_CONTENT - tileEntity.speed);
        };

        // move all the items by the speed amount
        for (let i = MAX_CONTENT; i > 0; i--) {
            moveItemsInArray(this.content, i - tileEntity.speed, tileEntity.speed);
        }
    }

    addEntity(entities: Array<Entity | undefined>): Array<Entity | undefined> {
        const transferdEntities = transferContent(entities, this.content) as Array<Entity | undefined>;
        return transferdEntities;
    }

    changeNeighbourTypeConveyer(placedTile: TileEntity, tileGrid: TileGrid) {
        for (const [neighbor, direction] of placedTile.getAllNeighbours(tileGrid)) {
            const willBeMerger = placedTile.direction !== neighbor.direction.mul(-1) && neighbor.inputTiles.size() === 1
            const willBeSplitter = direction === neighbor.direction.mul(-1) && neighbor.outputTiles.size() === 1
            if (willBeSplitter) {
                neighbor.interface = new Splitter();
                this.changeType(neighbor);
            } else if (willBeMerger) {
                neighbor.interface = new Merger();
                this.changeType(neighbor);
            }
        }
    }

    private changeType(tile: TileEntity) {
        tile.category = tile.interface.getCategory();
        tile.maxInputs = tile.interface.getMaxInputs();
        tile.maxOutputs = tile.interface.getMaxOutputs();
        let inputTiles = new Array<TileEntity>(tile.maxInputs);
        let outputTiles = new Array<TileEntity>(tile.maxOutputs);
        tile.inputTiles = copyArray(tile.inputTiles, inputTiles) as Array<TileEntity>;
        tile.outputTiles = copyArray(tile.outputTiles, outputTiles) as Array<TileEntity>;
    }

    // to optimize with pooling
    /**
     * change the basepart depending if the conveyer is turning
     */
    modifyIfTurningConveyer(conveyer: TileEntity, gridBase: BasePart): void {
        if (conveyer.inputTiles.isEmpty() || !(conveyer.inputTiles[0] instanceof TileEntity)) return;
        const isTurningConveyer = math.abs(conveyer.direction.X) !== math.abs(conveyer.inputTiles[0].direction.X);
        const isMergerConveyer = conveyer.inputTiles.size() > 1;
        const isSplitterConveyer = conveyer.inputTiles.size() > 1;

        if (isTurningConveyer) {
            this.changeToTurningConveyer(conveyer, gridBase);
        } else if (isMergerConveyer) {
            this.changeToMergerConveyer(conveyer, gridBase);
        }
    }

    private changeToTurningConveyer(conveyer: TileEntity, gridBase: BasePart) {
        const gridEntitiesPart = gridBase.FindFirstChild("PlacedObjects")?.GetChildren() as Array<BasePart>;

        conveyer.findThisPartInGridEntities(gridEntitiesPart, gridBase.Position)?.Destroy();

        const isTurningLeft = conveyer.inputTiles[0].direction.X === -conveyer.direction.Y && conveyer.inputTiles[0].direction.Y === conveyer.direction.X;
        const turningConveyer = findBasepartByName(conveyer.name + (isTurningLeft ? "T" : "TR"), conveyer.category);

        if (turningConveyer) {
            const newPostion = conveyer.position.add(gridBase.Position).sub(new Vector3(0, gridBase.Size.Y / 2, 0));
            const orientation = math.atan2(conveyer.direction.Y, conveyer.direction.X) + (isTurningLeft ? 0 : math.pi / 2);
            setupObject(turningConveyer, newPostion, orientation, gridBase);
        }
    }

    private changeToMergerConveyer(conveyer: TileEntity, gridBase: BasePart) {
        const gridEntitiesPart = gridBase.FindFirstChild("PlacedObjects")?.GetChildren() as Array<BasePart>;

        conveyer.findThisPartInGridEntities(gridEntitiesPart, gridBase.Position)?.Destroy();

        const isTurningLeft = conveyer.inputTiles[0].direction.X === -conveyer.direction.Y && conveyer.inputTiles[0].direction.Y === conveyer.direction.X;
        const mergerConveyer = findBasepartByName(conveyer.name + (isTurningLeft ? "T" : "TR"), conveyer.category);

        if (!mergerConveyer) error("Merger conveyer not found");

        const newPostion = conveyer.position.add(gridBase.Position).sub(new Vector3(0, gridBase.Size.Y / 2, 0));
        const orientation = math.atan2(conveyer.direction.Y, conveyer.direction.X) + (isTurningLeft ? 0 : math.pi / 2);
        setupObject(mergerConveyer, newPostion, orientation, gridBase);
    }

    getMaxInputs(): number {
        return MAX_INPUTS;
    }
    getMaxOutputs(): number {
        return MAX_OUTPUTS;
    }

    getCategory(): string {
        return category;
    }
}

export default Conveyer;
