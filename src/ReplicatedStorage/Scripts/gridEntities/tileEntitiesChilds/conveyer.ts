import type Entity from "ReplicatedStorage/Scripts/Content/Entities/entity";
import { TileEntity } from "../tileEntity";
import { moveItemsInArray, removeSegment, transferArrayContent } from "../conveyerUtils";
import { findBasepartByName } from "../tileEntityUtils";
import { setupObject } from "ReplicatedStorage/Scripts/placementHandler";
import { ReplicatedStorage } from "@rbxts/services";

//Setings
const MAX_CONTENT = 6;
const MAX_INPUTS = 1; // help to upgrade to merger or splitter
const MAX_OUTPUTS = 1; // help to upgrade to merger or splitter
const category: string = "conveyer";
const updateContentEvent = ReplicatedStorage.WaitForChild("Events").WaitForChild("conveyerContentUpdate") as RemoteEvent;

class Conveyer extends TileEntity {
    //new array fill with undifined
    content = new Array<Entity | undefined>(MAX_CONTENT, undefined);

    constructor(name: string, position: Vector3, size: Vector2, direction: Vector2, speed: number) {
        super(name, position, size, direction, speed, category, MAX_INPUTS, MAX_OUTPUTS);
    }

    /**
     * move all items on the conveyer
     */
    tick(progress: number): void {
        if (this.getProgress(progress) < this.lastProgress) {
            // send the item to the next gridEntity
            if (this.outputTiles[0] !== undefined) {
                this.outputTiles[0].addEntity(removeSegment(this.content, 0, 0) as Array<Entity | undefined>);
            };

            // move all the items by the speed amount
            moveItemsInArray(this.content);
            updateContentEvent.FireAllClients(this.copy());
        }
        this.lastProgress = this.getProgress(progress);
    }

    addEntity(entities: Array<Entity | undefined>): Array<Entity | undefined> {
        const transferdEntities = transferArrayContent(entities, this.content, MAX_CONTENT) as Array<Entity | undefined>;
        return transferdEntities;
    }

    // to optimize with pooling
    /**
     * change the basepart depending if the conveyer is turning
     */
    updateShape(gridBase: BasePart): void {
        const conveyerBasepart = this.findThisPartInWorld(gridBase);

        if (!this.inputTiles.isEmpty() && this.inputTiles[0] instanceof TileEntity && this.inputTiles[0].category !== "splitter") {
            const isTurningConveyer = math.abs(this.direction.X) !== math.abs(this.inputTiles[0].direction.X);
            const isAlreadyTurningConveyer = conveyerBasepart?.Name.match('/T|TR/') !== undefined;

            if (isTurningConveyer && !isAlreadyTurningConveyer) {
                conveyerBasepart?.Destroy();

                const isTurningLeft = this.inputTiles[0].direction.X === -this.direction.Y && this.inputTiles[0].direction.Y === this.direction.X;
                const turningConveyer = findBasepartByName(this.name + (isTurningLeft ? "T" : "TR"), this.category);

                setupObject(turningConveyer, this.getGlobalPosition(gridBase), this.getOrientation() + (isTurningLeft ? 0 : math.pi / 2), gridBase);
                return; // return here to don't switch to straight conveyer
            }
        }

        const isAlreadyStraightConveyer = conveyerBasepart?.Name === this.name;
        if (!isAlreadyStraightConveyer) {
            conveyerBasepart?.Destroy();
            const newPart = findBasepartByName((this.name) as string, this.category)
            setupObject(newPart, this.getGlobalPosition(gridBase), this.getOrientation(), gridBase);
        }
    }

    copy(): Conveyer {
        const newConveyer = new Conveyer(this.name, this.position, this.size, this.direction, this.speed);
        newConveyer.content = this.content;
        return newConveyer;
    }

    getMaxContent(): number {
        return MAX_CONTENT;
    }
}

export default Conveyer;
