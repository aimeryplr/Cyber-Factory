import { ReplicatedStorage, TweenService } from "@rbxts/services";
import Entity from "ReplicatedStorage/Scripts/Content/Entities/entity";
import Conveyer from "ReplicatedStorage/Scripts/gridEntities/tileEntitiesChilds/conveyer";
import { getGlobalPosition } from "ReplicatedStorage/Scripts/gridEntities/tileEntityUtils";

const offset = 0.5;
const destroyConveyerEvent = ReplicatedStorage.WaitForChild("Events").WaitForChild("destroyConveyer") as RemoteEvent;

class EntitiesHandler {
    // Vector3 is in local position
    conveyers: Map<Vector3, Conveyer> = new Map<Vector3, Conveyer>();
    entitiesBaseparts: Map<Vector3, Array<BasePart | undefined>> = new Map<Vector3, Array<BasePart | undefined>>();

    gridBase: BasePart;

    constructor(gridBase: BasePart) {
        this.gridBase = gridBase;
        this.handleConveyerDestroyEvent();
    }

    private handleConveyerDestroyEvent() {
        destroyConveyerEvent.OnClientEvent.Connect((conveyer: Conveyer) => {
            this.destroyConveyer(conveyer);
        });
    }

    /**
     * 
     * @param prevTileEntity local position of the previous conveyer
     */
    updateConveyerEntities(conveyer: Conveyer, prevTileEntity?: Vector3 | Conveyer) {
        const newConveyer = copyConveyer(conveyer);
        prevTileEntity = unSerialize(prevTileEntity);
        for (let i = 0; i < newConveyer.getMaxContent(); i++) {
            this.moveEntity(newConveyer, i, prevTileEntity);
        }
        this.conveyers.set(conveyer.position, newConveyer);
    }

    

    moveEntity(conveyer: Conveyer, i: number, prevTileEntity?: Vector3 | Conveyer) {
        let oldConveyer = this.conveyers.get(conveyer.position);
        const lastIndex = conveyer.getMaxContent() - 1;

        // setup the oldConveyer with an empty content
        if (!oldConveyer) {
            oldConveyer = conveyer.copy();
            oldConveyer.content = new Array<Entity | undefined>(lastIndex + 1, undefined);
            this.conveyers.set(conveyer.position, oldConveyer);
            this.entitiesBaseparts.set(oldConveyer.position, new Array<BasePart | undefined>(lastIndex + 1, undefined));
        }

        if (oldConveyer) {
            const previousConveyerPos = typeIs(prevTileEntity, "Vector3") ? prevTileEntity : (prevTileEntity as Conveyer).position;
            if (i === 0) {
                this.moveEntityToNextConveyer(conveyer, oldConveyer, previousConveyerPos);
            } else if (i === lastIndex) {
                this.spawnEntity(conveyer, oldConveyer, prevTileEntity);
            } else {
                this.moveEntityInConveyer(i, conveyer, oldConveyer, previousConveyerPos);
            }
        }
    }

    spawnEntity(conveyer: Conveyer, oldConveyer: Conveyer, prevTileEntity?: Vector3 | Conveyer) {
        const lastIndex = conveyer.getMaxContent() - 1;
        const entitiesBaseparts = this.entitiesBaseparts.get(conveyer.position)
        if (!entitiesBaseparts) error("conveyerEntitiesBaseparts is undefined");
        if (oldConveyer.content[lastIndex]?.id === conveyer.content[lastIndex]?.id || !conveyer.content[lastIndex]) return;
        let entity: BasePart | undefined;

        if (!prevTileEntity || typeIs(prevTileEntity, "Vector3")) {
            entity = ReplicatedStorage.WaitForChild("Entities").WaitForChild("copper").Clone() as BasePart;
            entity.Parent = this.gridBase.WaitForChild("Entities");
        } else {
            const previousEntities = this.entitiesBaseparts.get((prevTileEntity as Conveyer).position);
            if (!previousEntities) error("previousEntity is undefined");
            entity = previousEntities[0];
            previousEntities[0] = undefined
        }
        entitiesBaseparts[lastIndex] = entity;
        
        if (!entity) error("entity is undefined");
        if (conveyer.isTurning && prevTileEntity) {
            const previousConveyerPos = (prevTileEntity instanceof Conveyer) ? prevTileEntity.position : prevTileEntity;
            entity.Position = getEntityPositionInTurningConveyer(conveyer, previousConveyerPos, this.gridBase, lastIndex + 1);
            this.lerpEntity(entity, lastIndex, conveyer, getEntityPositionInTurningConveyer(conveyer, previousConveyerPos, this.gridBase, lastIndex));
        } else {
            entity.Position = getNewEntityPostion(conveyer, this.gridBase, lastIndex + 1);
            this.lerpEntity(entity, lastIndex, conveyer);
        }
    }

    moveEntityInConveyer(i: number, conveyer: Conveyer, oldConveyer: Conveyer, previousConveyerPos?: Vector3) {
        const conveyerEntitiesBaseparts = this.entitiesBaseparts.get(conveyer.position);
        const currentBasePart: BasePart | undefined = conveyerEntitiesBaseparts ? conveyerEntitiesBaseparts[i + 1] : undefined;
        if (!conveyerEntitiesBaseparts || !currentBasePart) return;
        if (!conveyer.content[i] || oldConveyer.content[i]?.id === conveyer.content[i]?.id) return;

        swapArrayElements(conveyerEntitiesBaseparts, i, i + 1);

        if (conveyer.isTurning && previousConveyerPos) {
            this.lerpEntity(currentBasePart, i, conveyer, getEntityPositionInTurningConveyer(conveyer, previousConveyerPos, this.gridBase, i));
        } else {
            this.lerpEntity(currentBasePart, i, conveyer);
        }
    }

    moveEntityToNextConveyer(conveyer: Conveyer, oldConveyer: Conveyer, previousConveyerPos?: Vector3) {
        const conveyerEntitiesBaseparts = this.entitiesBaseparts.get(conveyer.position);
        const currentBasePart: BasePart | undefined = conveyerEntitiesBaseparts ? conveyerEntitiesBaseparts[0] : undefined;
        const nextConveyer = this.conveyers.get(conveyer.position.add(new Vector3(conveyer.direction.X, 0, conveyer.direction.Y).mul(3)));

        if (oldConveyer.content[0]?.id === conveyer.content[0]?.id) return;
        if (!conveyerEntitiesBaseparts ) return;
        
        // destroy the entity
        if (!nextConveyer && currentBasePart) {
            currentBasePart.Destroy();
        }
        conveyerEntitiesBaseparts[0] = undefined;

        // move the entity to the next conveyer
        this.moveEntityInConveyer(0, conveyer, oldConveyer, previousConveyerPos);        
    }

    lerpEntity(basepart: BasePart | undefined, index: number, conveyer: Conveyer, goalPosition?: Vector3) {
        if (!basepart) error("basepart is undefined");
        const itemPerMinutes = 60 / conveyer.getAbsoluteSpeed()
        const goal = { Position: goalPosition ? goalPosition : getNewEntityPostion(conveyer, this.gridBase, index) }
        const tween = TweenService.Create(basepart, new TweenInfo(itemPerMinutes, Enum.EasingStyle.Linear), goal);
        tween.Play();
    }

    destroyConveyer(conveyer: Conveyer) {
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

function getNewEntityPostion(conveyer: Conveyer, gridBase: BasePart, index: number): Vector3 {
    return conveyer.getGlobalPosition(gridBase).add(new Vector3(conveyer.direction.X * offset * (3 - index), 0.7, conveyer.direction.Y * offset * (3 - index)));
}

function getEntityPositionInTurningConveyer(conveyer: Conveyer, previousConveyerPos: Vector3, gridBase: BasePart, index: number): Vector3 {
    const lastIndex = conveyer.getMaxContent();
    const middleIndex = math.round(conveyer.getMaxContent() / 2);
    const offset = 1.5 / middleIndex;
    const previousConveyerDirection = new Vector3(conveyer.position.X - previousConveyerPos.X, 0, conveyer.position.Z - previousConveyerPos.Z).Unit;
    const departPos = getGlobalPosition(conveyer.position, gridBase).add(previousConveyerDirection.mul(-1.5));

    if (index >= middleIndex) {
        return departPos.add(new Vector3(previousConveyerDirection.X * offset * (lastIndex - index), 0.7, previousConveyerDirection.Z * offset * (lastIndex - index)));
    } else {
        return getNewEntityPostion(conveyer, gridBase, index);
    }
}

function copyConveyer(conveyer: Conveyer) {
    const newConveyer = new Conveyer(conveyer.name, conveyer.position, conveyer.size, conveyer.direction, conveyer.speed);
    newConveyer.content = conveyer.content
    newConveyer.isTurning = conveyer.isTurning;
    return newConveyer;
}

function unSerialize(prevTileEntity: Vector3 | Conveyer | undefined): Vector3 | Conveyer | undefined {
    if (!prevTileEntity) return undefined
    if ((prevTileEntity as Vector3).X !== undefined) {
        return new Vector3((prevTileEntity as Vector3).X, (prevTileEntity as Vector3).Y, (prevTileEntity as Vector3).Z) ;
    } else {
        return copyConveyer(prevTileEntity as Conveyer);
    }
}
