import { type Entity } from "ReplicatedStorage/Scripts/Entities/entity";
import { EncodedTileEntity, TileEntity } from "../tileEntity";
import { moveItemsInArray } from "../Utils/conveyerUtils";
import { findBasepartByName } from "../Utils/tileEntityUtils";
import { setupObject } from "ReplicatedStorage/Scripts/placementHandlerUtils";
import { HttpService, ReplicatedStorage } from "@rbxts/services";
import { decodeArray, decodeVector2, decodeVector3, decodeVector3Array, encodeArray, encodeVector2, encodeVector3 } from "ReplicatedStorage/Scripts/Utils/encoding";
import { CONTENT_SIZE } from "ReplicatedStorage/parameters";

//Setings
const MAX_INPUTS = 1; // help to upgrade to merger or splitter
const MAX_OUTPUTS = 1; // help to upgrade to merger or splitter
const category: string = "conveyor";
const updateContentEvent = ReplicatedStorage.WaitForChild("Events").WaitForChild("conveyerContentUpdate") as RemoteEvent;

export interface EncodedConveyor extends EncodedTileEntity {
    content: Array<Entity | undefined>,
    isTurning: boolean,
}

class Conveyor extends TileEntity {
    //new array fill with undifined
    content = new Array<Entity | undefined>(CONTENT_SIZE, undefined);
    isTurning = false;
    count = 0

    constructor(name: string, position: Vector3, size: Vector2, direction: Vector2, speed: number, gridBase?: BasePart) {
        super(name, position, size, direction, speed, category, MAX_INPUTS, MAX_OUTPUTS, gridBase);
    }

    /**
     * move all items on the conveyer
     */
    tick(progress: number): void {
        if (this.getProgress(progress) < this.lastProgress) {
            // send the item to the next gridEntity
            if (this.outputTiles[0] !== undefined && this.content[0] !== undefined) {
                this.content[0] = this.outputTiles[0].addEntity(this.content[0]);
            };

            // move all the items by the speed amount
            moveItemsInArray(this.content, CONTENT_SIZE);
            updateContentEvent.FireAllClients(HttpService.JSONEncode(this.encode()));
        }
        this.lastProgress = this.getProgress(progress);
    }

    addEntity(entity: Entity): Entity | undefined {
        if (!(this.inputTiles[0] instanceof Conveyor)) this.setupIds(entity);
        if (this.content[CONTENT_SIZE - 1] !== undefined) return entity;
        this.content[CONTENT_SIZE - 1] = entity;
        updateContentEvent.FireAllClients(HttpService.JSONEncode(this.encode()));
        return;
    }

    setupIds(entity: Entity) {
        entity.id = this.count % CONTENT_SIZE;
        this.count++;
    }

    // to optimize with pooling
    /**
     * change the basepart depending if the conveyer is turning
     */
    getNewShape(gridBase: BasePart, tilePart?: BasePart): BasePart | undefined {
        const conveyerBasepart = tilePart ?? this.findThisPartInWorld();

        if (!this.inputTiles.isEmpty() && this.inputTiles[0] instanceof TileEntity) {
            const isTurningConveyer = this.getIsTurning();
            const isAlreadyTurningConveyer = conveyerBasepart?.Name.match('/T|TR/') !== undefined;

            if (isTurningConveyer && !isAlreadyTurningConveyer) {
                const isTurningLeft = this.inputTiles[0].direction.X === -this.direction.Y && this.inputTiles[0].direction.Y === this.direction.X;
                return findBasepartByName(this.name + (isTurningLeft ? "T" : "TR"));
            }
        }

        const isAlreadyStraightConveyer = conveyerBasepart?.Name === this.name;
        if (!isAlreadyStraightConveyer) {
            return findBasepartByName(this.name as string)
        }

        this.isTurning = this.getIsTurning();
    }

    updateShape(gridBase: BasePart): void {
        const newShape = this.getNewShape(gridBase);
        const currentBasePart = this.findThisPartInWorld();
        if (!currentBasePart) return;

        if (newShape) {
            currentBasePart.Destroy();
            setupObject(newShape, this.getGlobalPosition(gridBase), this.getOrientation(), gridBase);
        } else {
            currentBasePart.Orientation = new Vector3(0, this.getOrientation(), 0);
        }
    }

    getIsTurning() {
        if (this.inputTiles.isEmpty()) return false;

        const neighbourDirection = this.position.sub(this.inputTiles[0].position) 
        if (this.inputTiles[0].category === "splitter") return this.direction !== new Vector2(neighbourDirection.X, neighbourDirection.Z).Unit;
        return math.abs(this.direction.X) !== math.abs(this.inputTiles[0].direction.X);
    }

    canConnectInput(neighbourTile: TileEntity, neighbourTileDirection: Vector2): boolean {
        if (neighbourTile.category === "splitter" && neighbourTileDirection.mul(-1) !== this.direction && neighbourTile.direction !== neighbourTileDirection) return true;
        return neighbourTile.direction === neighbourTileDirection.mul(-1)
    }

    copy(): Conveyor {
        const newConveyer = new Conveyor(this.name, this.position, this.size, this.direction, this.speed);
        newConveyer.content = this.content;
        newConveyer.isTurning = this.isTurning;
        return newConveyer;
    }

    getMaxContentSize(): number {
        return CONTENT_SIZE;
    }

    encode(): {} {
        const copy = {
            ...super.encode(),
            "content": encodeArray(this.content, CONTENT_SIZE),
            "isTurning": this.getIsTurning()
        }
        return copy;
    }

    static decode(decoded: unknown): Conveyor {
        const data = decoded as EncodedConveyor;
        const conveyer = new Conveyor(data.name, decodeVector3(data.position), decodeVector2(data.size), decodeVector2(data.direction), data.speed);
        conveyer.content = decodeArray(data.content);
        conveyer.isTurning = data.isTurning;
        conveyer.inputTiles = decodeVector3Array(data.inputTiles) as TileEntity[];
        conveyer.outputTiles = decodeVector3Array(data.outputTiles) as TileEntity[];
        return conveyer;
    }
}

export default Conveyor;
