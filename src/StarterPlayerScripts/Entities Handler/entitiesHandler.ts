import { HttpService, ReplicatedStorage, TweenService } from "@rbxts/services";
import { CONTENT_SIZE } from "ReplicatedStorage/parameters";
import { Entity } from "ReplicatedStorage/Scripts/Entities/entity";
import { getEntityModel } from "ReplicatedStorage/Scripts/Entities/entityUtils";
import Conveyor from "ReplicatedStorage/Scripts/Tile Entities/tileEntitiesChilds/conveyor";

const offset = 0.5;
const destroyConveyerEvent = ReplicatedStorage.WaitForChild("Events").WaitForChild("destroyConveyer") as RemoteEvent;
const LAST_INDEX = CONTENT_SIZE - 1

class EntitiesHandler {
    // Vector3 is in local position
    conveyers: Map<Vector3, Conveyor> = new Map<Vector3, Conveyor>();
    entitiesBaseparts: Map<Vector3, Array<BasePart | undefined>> = new Map<Vector3, Array<BasePart | undefined>>();

    gridBase: BasePart;

    constructor(gridBase: BasePart) {
        this.gridBase = gridBase;
        this.handleConveyerDestroyEvent();
    }

    private handleConveyerDestroyEvent() {
        destroyConveyerEvent.OnClientEvent.Connect((conveyer: Conveyor) => {
            this.destroyConveyer(conveyer);
        });
    }

    /**
     * @param prevTileEntity local position of the previous conveyer
     */
    updateConveyerEntities(conveyer: string) {
        const newConveyer = Conveyor.decode(HttpService.JSONDecode(conveyer));

        for (let i = 0; i < CONTENT_SIZE; i++) {
            this.moveEntity(newConveyer, i);
        }
        this.conveyers.set(newConveyer.position, newConveyer);
    }

    setupNewConveyer(conveyer: Conveyor) {
        const oldConveyer = conveyer.copy();
        oldConveyer.content = new Array<Entity | undefined>(CONTENT_SIZE, undefined);
        this.conveyers.set(conveyer.position, oldConveyer);
        this.entitiesBaseparts.set(oldConveyer.position, new Array<BasePart | undefined>(CONTENT_SIZE, undefined));
    }

    moveEntity(conveyer: Conveyor, i: number) {
        let oldConveyer = this.conveyers.get(conveyer.position);

        // setup the oldConveyer with an empty content
        if (!oldConveyer) {
            this.setupNewConveyer(conveyer)
        }

        if (oldConveyer) {
            if (i === 0) {
                this.moveEntityToNextConveyer(conveyer, oldConveyer);
            } else if (i === LAST_INDEX) {
                this.spawnEntity(conveyer, oldConveyer);
            } else {
                this.moveEntityInConveyer(i, conveyer, oldConveyer);
            }
        }
    }

    setupEntity(entity: BasePart, conveyer: Conveyor) {
        entity.Orientation = new Vector3(0, conveyer.getOrientation(), 0);
        entity.Anchored = true;
        entity.Position = getNewEntityPostion(conveyer, this.gridBase, LAST_INDEX + 1, entity.Size.Y / 2);
        entity.Parent = this.gridBase.FindFirstChild("Entities");
    }

    spawnEntity(conveyer: Conveyor, oldConveyer: Conveyor) {
        const entitiesBaseparts = this.entitiesBaseparts.get(conveyer.position)
        if (!entitiesBaseparts) error("conveyerEntitiesBaseparts is undefined");
        if (oldConveyer.content[LAST_INDEX]?.id === conveyer.content[LAST_INDEX]?.id || !conveyer.content[LAST_INDEX]) return;
        let entity: BasePart | undefined;

        const prevTileEntityPosition = conveyer.inputTiles[0] as unknown;

        if (!prevTileEntityPosition || !this.entitiesBaseparts.get(prevTileEntityPosition as Vector3)) {
            entity = getEntityModel(conveyer.content[LAST_INDEX]!);
            if (!entity) error(`entity ${conveyer.content[LAST_INDEX]!.name} is undefined`);
            this.setupEntity(entity, conveyer)
        } else {
            const previousEntities = this.entitiesBaseparts.get(prevTileEntityPosition as Vector3);
            if (!previousEntities) error("previousEntity is undefined");
            entity = previousEntities[0];
            previousEntities[0] = undefined
        }
        entitiesBaseparts[LAST_INDEX] = entity;

        if (!entity) error("entity is undefined");
        
        this.moveEntityInConveyer(LAST_INDEX, conveyer, oldConveyer)

        /*
        const entityHeightPos = entity.Size.Y / 2;
        if (conveyer.isTurning && prevTileEntityPosition) {
            entity.Position = getEntityPositionInTurningConveyer(conveyer, prevTileEntityPosition as Vector3, this.gridBase, LAST_INDEX + 1, entityHeightPos);
            this.lerpEntity(entity, LAST_INDEX, conveyer, getEntityPositionInTurningConveyer(conveyer, prevTileEntityPosition as Vector3, this.gridBase, LAST_INDEX, entityHeightPos));
        } else {
            entity.Position = getNewEntityPostion(conveyer, this.gridBase, LAST_INDEX + 1, entityHeightPos);
            this.lerpEntity(entity, LAST_INDEX, conveyer);
        }
        */
    }

    moveEntityInConveyer(i: number, conveyer: Conveyor, oldConveyer: Conveyor) {
        const conveyerEntitiesBaseparts = this.entitiesBaseparts.get(conveyer.position)!;
        const currentBasePart = conveyerEntitiesBaseparts[i + 1];
        if (!conveyerEntitiesBaseparts || !currentBasePart) return;
        const prevTileEntityPosition = conveyer.inputTiles[0] as unknown;
        const shouldMove = shouldMoveEntityInConveyer(conveyer, oldConveyer, i);
        if (!shouldMove) return;

        swapArrayElements(conveyerEntitiesBaseparts, i, i + 1);

        if (conveyer.isTurning && prevTileEntityPosition) {
            this.lerpEntity(currentBasePart, i, conveyer, getEntityPositionInTurningConveyer(conveyer, prevTileEntityPosition as Vector3, this.gridBase, i, currentBasePart.Size.Y / 2));
        } else {
            this.lerpEntity(currentBasePart, i, conveyer);
        }
    }

    moveEntityToNextConveyer(conveyer: Conveyor, oldConveyer: Conveyor) {
        const conveyerEntitiesBaseparts = this.entitiesBaseparts.get(conveyer.position);
        const currentBasePart: BasePart | undefined = conveyerEntitiesBaseparts ? conveyerEntitiesBaseparts[0] : undefined;
        const nextConveyer = this.conveyers.get(conveyer.position.add(new Vector3(conveyer.direction.X, 0, conveyer.direction.Y).mul(3)));

        if (oldConveyer.content[0]?.id === conveyer.content[0]?.id) return;
        if (!conveyerEntitiesBaseparts) return;

        // destroy the entity
        if (!nextConveyer && currentBasePart) {
            currentBasePart.Destroy();
        }
        conveyerEntitiesBaseparts[0] = undefined;

        // move the entity to the next conveyer
        this.moveEntityInConveyer(0, conveyer, oldConveyer);
    }

    lerpEntity(basepart: BasePart | undefined, index: number, conveyer: Conveyor, goalPosition?: Vector3) {
        if (!basepart) error("basepart is undefined");
        const itemPerMinutes = 60 / conveyer.speed
        const goal = { Position: goalPosition ? goalPosition : getNewEntityPostion(conveyer, this.gridBase, index, basepart.Size.Y / 2) }
        const tween = TweenService.Create(basepart, new TweenInfo(itemPerMinutes, Enum.EasingStyle.Linear), goal);
        tween.Play();
    }

    destroyConveyer(conveyer: Conveyor) {
        const conveyerEntitiesBaseparts = this.entitiesBaseparts.get(conveyer.position);
        if (!conveyerEntitiesBaseparts) return;

        for (const basepart of conveyerEntitiesBaseparts) {
            if (basepart) basepart.Destroy();
        }

        this.entitiesBaseparts.delete(conveyer.position);
        this.conveyers.delete(conveyer.position);
    }
}

export default EntitiesHandler;

function swapArrayElements(array: Array<unknown | undefined>, index1: number, index2: number) {
    const temp = array[index1];
    array[index1] = array[index2];
    array[index2] = temp;
}

function getNewEntityPostion(conveyer: Conveyor, gridBase: BasePart, index: number, partHeight: number): Vector3 {
    return conveyer.getGlobalPosition(gridBase).add(new Vector3(conveyer.direction.X * offset * (3 - index), 0.15 + partHeight / 2, conveyer.direction.Y * offset * (3 - index)));
}

function getEntityPositionInTurningConveyer(conveyer: Conveyor, previousConveyerPos: Vector3, gridBase: BasePart, index: number, partHeight: number): Vector3 {
    const LAST_INDEX = CONTENT_SIZE;
    const middleIndex = math.round(CONTENT_SIZE / 2);
    const offset = 1.5 / middleIndex;
    const previousConveyerDirection = new Vector3(conveyer.position.X - previousConveyerPos.X, 0, conveyer.position.Z - previousConveyerPos.Z).Unit;
    const departPos = conveyer.getGlobalPosition(gridBase).add(previousConveyerDirection.mul(-1.5));

    if (index >= middleIndex) {
        return departPos.add(new Vector3(previousConveyerDirection.X * offset * (LAST_INDEX - index), 0.15 + partHeight / 2, previousConveyerDirection.Z * offset * (LAST_INDEX - index)));
    } else {
        return getNewEntityPostion(conveyer, gridBase, index, partHeight);
    }
}

function shouldMoveEntityInConveyer(conveyer: Conveyor, oldConveyer: Conveyor, i: number) {
    if (!conveyer.content[i]) return false;
    if (!oldConveyer.content || !oldConveyer.content[i]) return true;
    if (oldConveyer.content[i]?.id === conveyer.content[i]?.id) return false;

    return true;
}

