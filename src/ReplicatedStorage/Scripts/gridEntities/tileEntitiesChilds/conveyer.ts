import type Entity from "ReplicatedStorage/Scripts/Content/Entities/entity";
import { TileEntity } from "../tileEntity";
import { addBackContent, moveItemsInArray, removeSegment, transferArrayContent } from "../conveyerUtils";
import { findBasepartByName } from "../tileEntityUtils";
import { setupObject } from "ReplicatedStorage/Scripts/placementHandler";
import { HttpService, ReplicatedStorage } from "@rbxts/services";
import { decodeArray, decodeVector2, decodeVector3, decodeVector3Array, encodeArray, encodeVector2, encodeVector3 } from "ReplicatedStorage/Scripts/encoding";

//Setings
const MAX_SIZE = 6;
const MAX_INPUTS = 1; // help to upgrade to merger or splitter
const MAX_OUTPUTS = 1; // help to upgrade to merger or splitter
const category: string = "conveyer";
const updateContentEvent = ReplicatedStorage.WaitForChild("Events").WaitForChild("conveyerContentUpdate") as RemoteEvent;

class Conveyer extends TileEntity {
    //new array fill with undifined
    content = new Array<Entity | undefined>(MAX_SIZE, undefined);
    isTurning = false;

    constructor(name: string, position: Vector3, size: Vector2, direction: Vector2, speed: number) {
        super(name, position, size, direction, speed, category, MAX_INPUTS, MAX_OUTPUTS);
    }

    /**
     * move all items on the conveyer
     */
    tick(progress: number): void {
        if (this.getProgress(progress) < this.lastProgress) {
            // send the item to the next gridEntity
            if (this.outputTiles[0] !== undefined && this.content[0] !== undefined) {
                const arrayToAddBack = this.outputTiles[0].addEntity(removeSegment(this.content, 0, 0) as Array<Entity | undefined>);
                addBackContent(arrayToAddBack, this.content, MAX_SIZE);
            };

            // move all the items by the speed amount
            moveItemsInArray(this.content, MAX_SIZE);
            updateContentEvent.FireAllClients(HttpService.JSONEncode(this.encode()));
        }
        this.lastProgress = this.getProgress(progress);
    }

    addEntity(entities: Array<Entity | undefined>): Array<Entity | undefined> {
        if (!(this.inputTiles[0] instanceof Conveyer)) this.setupIds(entities);
        const transferdEntities = transferArrayContent(entities, this.content, MAX_SIZE) as Array<Entity | undefined>;
        updateContentEvent.FireAllClients(HttpService.JSONEncode(this.encode()));
        return transferdEntities;
    }

    setupIds(entities: (Entity | undefined)[]) {
        let count = calulateId(this.content[4]?.id ?? 0)
        for (const entity of entities) {
            if (entity !== undefined) {
                entity.id = count;
                count = calulateId(count);
            }
        }
    }

    // to optimize with pooling
    /**
     * change the basepart depending if the conveyer is turning
     */
    updateShape(gridBase: BasePart): void {
        const conveyerBasepart = this.findThisPartInWorld(gridBase);

        if (!this.inputTiles.isEmpty() && this.inputTiles[0] instanceof TileEntity && this.inputTiles[0].category !== "splitter") {
            const isTurningConveyer = this.getIsTurning();
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

        this.isTurning = this.getIsTurning();
    }

    getIsTurning() {
        if (this.inputTiles.isEmpty()) return false;
        return math.abs(this.direction.X) !== math.abs(this.inputTiles[0].direction.X);
    }

    copy(): Conveyer {
        const newConveyer = new Conveyer(this.name, this.position, this.size, this.direction, this.speed);
        newConveyer.content = this.content;
        newConveyer.isTurning = this.isTurning;
        return newConveyer;
    }

    getMaxContentSize(): number {
        return MAX_SIZE;
    }

    encode(): {} {
        const copy = {
            "name": this.name,
            "category": this.category,
            "position": encodeVector3(this.position),
            "size": encodeVector2(this.size),
            "direction": encodeVector2(this.direction),
            "speed": this.speed,
            "content": encodeArray(this.content, MAX_SIZE),
            "inputTiles": this.inputTiles.map((tile) => encodeVector3(tile.position)),
            "outputTiles": this.outputTiles.map((tile) => encodeVector3(tile.position)),
            "isTurning": this.getIsTurning()
        }
        return copy;
    }

    static decode(decoded: unknown): Conveyer {
        const data  = decoded as { name: string, position: { x: number, y: number, z: number }, size: { x: number, y: number },  direction: { x: number, y: number }, speed: number, content: Array<Entity | undefined>, inputTiles: Array<{x: number, y: number, z: number}>, outputTiles: Array<{x: number, y: number, z: number}>, isTurning: boolean };
        const conveyer = new Conveyer(data.name, decodeVector3(data.position), decodeVector2(data.size), decodeVector2(data.direction), data.speed);
        conveyer.content = decodeArray(data.content);
        conveyer.isTurning = data.isTurning;
        conveyer.inputTiles = decodeVector3Array(data.inputTiles) as TileEntity[];
        conveyer.outputTiles = decodeVector3Array(data.outputTiles) as TileEntity[];
        return conveyer;
    }
}

function calulateId(count: number) {
    return (count + 1) % MAX_SIZE;
}

export default Conveyer;
