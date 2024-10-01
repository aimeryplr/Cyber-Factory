import { ReplicatedStorage, TweenService } from "@rbxts/services";
import Entity from "ReplicatedStorage/Scripts/Content/Entities/entity";
import Conveyer from "ReplicatedStorage/Scripts/gridEntities/tileEntitiesChilds/conveyer";

const offset = 0.5;

class EntitiesHandler {
    // Vector3 is in local position
    conveyers: Map<Vector3, Conveyer> = new Map<Vector3, Conveyer>();
    entitiesBaseparts: Map<Vector3, Array<BasePart | undefined>> = new Map<Vector3, Array<BasePart | undefined>>();

    gridBase: BasePart;

    constructor(gridBase: BasePart) {
        this.gridBase = gridBase;
    }

    updateConveyerEntities(conveyer: Conveyer) {
        const newConveyer = new Conveyer(conveyer.name, conveyer.position, conveyer.size, conveyer.direction, conveyer.speed);
        newConveyer.content = conveyer.content
        for (let i = 0; i < newConveyer.getMaxContent(); i++) {
            this.moveEntity(newConveyer, i);
        }
        this.conveyers.set(conveyer.position, newConveyer);
    }

    moveEntity(conveyer: Conveyer, i: number) {
        let oldConveyer = this.conveyers.get(conveyer.position);
        const maxSize = conveyer.getMaxContent();

        // setup the oldConveyer with an empty content
        if (!oldConveyer) {
            oldConveyer = conveyer.copy();
            oldConveyer.content = new Array<Entity | undefined>(maxSize, undefined);
            this.conveyers.set(conveyer.position, oldConveyer);
            this.entitiesBaseparts.set(oldConveyer.position, new Array<BasePart | undefined>(maxSize, undefined));
        }

        if (oldConveyer) {
            if (i === 0) {
                this.moveEntityToNextConveyer(conveyer, oldConveyer);
            } else if (i === maxSize - 1 && !(conveyer.inputTiles[0] instanceof Conveyer)) {
                this.spawnEntity(conveyer, oldConveyer);
            } else {
                this.moveEntityInConveyer(i, conveyer);
            }
        }
    }

    spawnEntity(conveyer: Conveyer, oldConveyer: Conveyer) {
        const lastIndex = conveyer.getMaxContent() - 1;
        if (oldConveyer.content[lastIndex] === conveyer.content[lastIndex]) return;
        const entity = ReplicatedStorage.WaitForChild("Entities").WaitForChild("copper").Clone() as BasePart;
        const entitiesBaseparts = this.entitiesBaseparts.get(conveyer.position)
        if (!entitiesBaseparts) error("conveyerEntitiesBaseparts is undefined");

        entitiesBaseparts[lastIndex] = entity;
        entity.Parent = this.gridBase.WaitForChild("Entities");
        entity.Position = getNewEntityPostion(conveyer, this.gridBase, lastIndex + 1);
        this.lerpEntity(entity, lastIndex, conveyer);
    }
    
    moveEntityInConveyer(i: number, conveyer: Conveyer) {
        const conveyerEntitiesBaseparts = this.entitiesBaseparts.get(conveyer.position);
        const currentBasePart: BasePart | undefined = conveyerEntitiesBaseparts ? conveyerEntitiesBaseparts[i + 1] : undefined;
        if (!conveyerEntitiesBaseparts || !currentBasePart) return;
        swapArrayElements(conveyerEntitiesBaseparts, i, i + 1);
        this.lerpEntity(currentBasePart, i, conveyer);
    }

    moveEntityToNextConveyer(conveyer: Conveyer, oldConveyer: Conveyer) {
        const nextConveyer = conveyer.outputTiles[0];
        const maxSize = conveyer.getMaxContent();
        const conveyerEntitiesBaseparts = this.entitiesBaseparts.get(conveyer.position);
        const currentBasePart: BasePart | undefined = conveyerEntitiesBaseparts ? conveyerEntitiesBaseparts[1] : undefined;

        // destroy the entity if the next conveyer is not a conveyer
        if ((!nextConveyer || !(nextConveyer instanceof Conveyer)) && conveyerEntitiesBaseparts && currentBasePart) {
            this.lerpEntity(currentBasePart, 0, conveyer);
            // launch a couroutine to destroy the entity
            const destroying = coroutine.create((currentBasePart: BasePart) => {
                wait(60 / (conveyer.getAbsoluteSpeed()));
                currentBasePart.Destroy();
            });
            coroutine.resume(destroying, currentBasePart);
            conveyerEntitiesBaseparts[0] = undefined;
            return;
        }

        // check if has to move the entity to the next conveyer
        if (oldConveyer.content[0] === undefined || !(oldConveyer.outputTiles[0] instanceof Conveyer) || !(nextConveyer instanceof Conveyer)) return;
        const hasLastEntityOnNextConveyerNotMoved = oldConveyer.outputTiles[0] instanceof Conveyer && nextConveyer.content[maxSize - 1] === oldConveyer.outputTiles[0].content[maxSize - 1]
        if (hasLastEntityOnNextConveyerNotMoved) return;

        // move the entity to the next conveyer
        if (nextConveyer.content[maxSize - 1] === oldConveyer.content[0]) {
            const nextConveyerEntitiesBaseparts = this.entitiesBaseparts.get(nextConveyer.position);
            if (!nextConveyerEntitiesBaseparts) error("lastConveyerEntitiesBaseparts is undefined");
            if (!conveyerEntitiesBaseparts) error("conveyerEntitiesBaseparts is undefined");

            const basepart = conveyerEntitiesBaseparts[0];
            conveyerEntitiesBaseparts[0] = undefined;
            nextConveyerEntitiesBaseparts[maxSize - 1] = basepart;
            this.lerpEntity(basepart, maxSize - 1, nextConveyer);
        }
    }

    lerpEntity(basepart: BasePart | undefined, index: number, conveyer: Conveyer) {
        if (!basepart) error("basepart is undefined");
        const itemPerMinutes = 60 / conveyer.getAbsoluteSpeed()
        const tween = TweenService.Create(basepart, new TweenInfo(itemPerMinutes, Enum.EasingStyle.Linear), { Position: getNewEntityPostion(conveyer, this.gridBase, index) });
        tween.Play();
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