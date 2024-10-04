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
     * @param previousConveyerPos local position of the previous conveyer
     */
    updateConveyerEntities(conveyer: Conveyer, previousConveyerPos?: Vector3) {
        const newConveyer = copyConveyer(conveyer);
        for (let i = 0; i < newConveyer.getMaxContent(); i++) {
            this.moveEntity(newConveyer, i, previousConveyerPos);
        }
        this.conveyers.set(conveyer.position, newConveyer);
    }

    

    moveEntity(conveyer: Conveyer, i: number, previousConveyerPos?: Vector3) {
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
            if (i === 0) {
                this.moveEntityToNextConveyer(conveyer);
            } else if (i === lastIndex && !(conveyer.inputTiles[0] instanceof Conveyer)) {
                this.spawnEntity(conveyer, oldConveyer, previousConveyerPos);
            } else {
                this.moveEntityInConveyer(i, conveyer, previousConveyerPos);
            }
        }
    }

    spawnEntity(conveyer: Conveyer, oldConveyer: Conveyer, previousConveyerPos?: Vector3) {
        const lastIndex = conveyer.getMaxContent() - 1;
        print(oldConveyer.content[lastIndex], conveyer.content[lastIndex])
        if (oldConveyer.content[lastIndex] === conveyer.content[lastIndex] || !conveyer.content[lastIndex]) return;
        const entitiesBaseparts = this.entitiesBaseparts.get(conveyer.position)
        if (!entitiesBaseparts) error("conveyerEntitiesBaseparts is undefined");
        let entity: BasePart | undefined;

        if (!previousConveyerPos) {
            entity = ReplicatedStorage.WaitForChild("Entities").WaitForChild("copper").Clone() as BasePart;
            entity.Parent = this.gridBase.WaitForChild("Entities");
        } else {
            const previousEntities = this.entitiesBaseparts.get(previousConveyerPos);
            if (!previousEntities) error("previousEntity is undefined");
            entity = previousEntities[0];
            previousEntities[0] = undefined
        }
        entitiesBaseparts[lastIndex] = entity;
        
        if (!entity) error("entity is undefined");
        if (conveyer.isTurning && previousConveyerPos) {
            entity.Position = getEntityPositionInTurningConveyer(conveyer, previousConveyerPos, this.gridBase, lastIndex + 1);
            this.lerpEntity(entity, lastIndex, conveyer, getEntityPositionInTurningConveyer(conveyer, previousConveyerPos, this.gridBase, lastIndex));
        } else {
            entity.Position = getNewEntityPostion(conveyer, this.gridBase, lastIndex + 1);
            this.lerpEntity(entity, lastIndex, conveyer);
        }
    }

    moveEntityInConveyer(i: number, conveyer: Conveyer, previousConveyerPos?: Vector3) {
        const conveyerEntitiesBaseparts = this.entitiesBaseparts.get(conveyer.position);
        const currentBasePart: BasePart | undefined = conveyerEntitiesBaseparts ? conveyerEntitiesBaseparts[i + 1] : undefined;
        if (!conveyerEntitiesBaseparts || !currentBasePart) return;

        swapArrayElements(conveyerEntitiesBaseparts, i, i + 1);

        if (conveyer.isTurning && previousConveyerPos) {
            this.lerpEntity(currentBasePart, i, conveyer, getEntityPositionInTurningConveyer(conveyer, previousConveyerPos, this.gridBase, i));
        } else {
            this.lerpEntity(currentBasePart, i, conveyer);
        }
    }

    moveEntityToNextConveyer(conveyer: Conveyer) {
        const conveyerEntitiesBaseparts = this.entitiesBaseparts.get(conveyer.position);
        const currentBasePart: BasePart | undefined = conveyerEntitiesBaseparts ? conveyerEntitiesBaseparts[1] : undefined;
        const nextConveyer = this.conveyers.get(conveyer.position.add(new Vector3(conveyer.direction.X, 0, conveyer.direction.Y).mul(3)));

        if (!conveyerEntitiesBaseparts || !currentBasePart) return;
        swapArrayElements(conveyerEntitiesBaseparts, 0, 1);
        // destroy the entity
        this.lerpEntity(currentBasePart, 0, conveyer);
        if (!nextConveyer) {
            // launch a couroutine to destroy the entity
            const destroying = coroutine.create((currentBasePart: BasePart) => {
                wait(60 / (conveyer.getAbsoluteSpeed()));
                currentBasePart.Destroy();
            });
            coroutine.resume(destroying, currentBasePart);
        }
        return;
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
        if (!conveyerEntitiesBaseparts) error("conveyerEntitiesBaseparts is undefined");

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