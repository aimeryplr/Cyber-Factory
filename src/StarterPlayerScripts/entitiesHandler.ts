import { ReplicatedStorage } from "@rbxts/services";
import Ressource from "ReplicatedStorage/Scripts/Content/Entities/ressource";
import RessourceType from "ReplicatedStorage/Scripts/Content/Entities/ressourceEnum";
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
        print(newConveyer.content, this.conveyers.get(conveyer.position)?.content)
        for (let i = 0; i < newConveyer.getMaxContent(); i++) {
            this.moveEntity(newConveyer, i);
        }
        print(newConveyer.content, this.conveyers.get(conveyer.position)?.content)
        this.conveyers.set(conveyer.position, newConveyer);
    }

    moveEntity(conveyer: Conveyer, i: number) {
        print("moveEntity");
        const oldConveyer = this.conveyers.get(conveyer.position);
        const maxSize = conveyer.getMaxContent();

        if (oldConveyer) {
            if (i === 0) {
                this.moveEntityToNextConveyer(conveyer, oldConveyer);
            } else if (i === maxSize - 1 && !(conveyer.inputTiles[0] instanceof Conveyer)) {
                this.spawnEntity(conveyer, oldConveyer);
            } else {
                this.moveEntityInConveyer(i, conveyer);
            }
        } else {
            this.conveyers.set(conveyer.position, conveyer);
            this.entitiesBaseparts.set(conveyer.position, new Array<BasePart | undefined>(conveyer.getMaxContent(), undefined));
            this.moveEntity(conveyer, maxSize - 1);
        }
    }

    spawnEntity(conveyer: Conveyer, oldConveyer: Conveyer) {
        print("spawnEntity");
        const lastIndex = conveyer.getMaxContent() - 1;
        print(oldConveyer.content[lastIndex], conveyer.content[lastIndex])
        if (oldConveyer.content[lastIndex] === conveyer.content[lastIndex]) return;
        const entity = ReplicatedStorage.WaitForChild("Entities").WaitForChild("copper").Clone() as BasePart;
        const entitiesBaseparts = this.entitiesBaseparts.get(conveyer.position)
        if (!entitiesBaseparts) error("conveyerEntitiesBaseparts is undefined");

        entitiesBaseparts[lastIndex] = entity;
        entity.Parent = this.gridBase.WaitForChild("Entities");
        entity.Position = conveyer.getGlobalPosition(this.gridBase).add(new Vector3(offset * -3, 1.5, 0));
    }
    
    moveEntityInConveyer(i: number, conveyer: Conveyer) {
        print("moveEntityInConveyer");
        const conveyerEntitiesBaseparts = this.entitiesBaseparts.get(conveyer.position);
        const currentBasePart: BasePart | undefined = conveyerEntitiesBaseparts ? conveyerEntitiesBaseparts[0] : undefined;
        if (!conveyerEntitiesBaseparts || !currentBasePart) return;
        
        swapArrayElements(conveyerEntitiesBaseparts, i, i + 1);
        this.lerpEntity(currentBasePart, i, conveyer);
    }

    moveEntityToNextConveyer(conveyer: Conveyer, oldConveyer: Conveyer) {
        print("moveEntityToNextConveyer");
        const nextConveyer = conveyer.outputTiles[0];
        const maxSize = conveyer.getMaxContent();
        const conveyerEntitiesBaseparts = this.entitiesBaseparts.get(conveyer.position);
        const currentBasePart: BasePart | undefined = conveyerEntitiesBaseparts ? conveyerEntitiesBaseparts[0] : undefined;

        if ((!nextConveyer || !(nextConveyer instanceof Conveyer)) && conveyerEntitiesBaseparts && currentBasePart) {
            const newPos = conveyer.getGlobalPosition(this.gridBase).add(new Vector3(offset * 3, 1.5, 0));
            currentBasePart.CFrame.Lerp(new CFrame(new Vector3(1.5, 1.5, 0)), 0.1);
            // launch a couroutine to destroy the entity
            const destroying = coroutine.create((currentBasePart: BasePart) => {
                wait(0.2);
                currentBasePart.Destroy();
            });
            coroutine.resume(destroying);
            conveyerEntitiesBaseparts[0] = undefined;
            return;
        }
        if (oldConveyer.content[0] === undefined || !(oldConveyer.outputTiles[0] instanceof Conveyer) || !(nextConveyer instanceof Conveyer)) return;
        const hasLastEntityOnNextConveyerNotMoved = oldConveyer.outputTiles[0] instanceof Conveyer && nextConveyer.content[maxSize - 1] === oldConveyer.outputTiles[0].content[maxSize - 1]
        if (hasLastEntityOnNextConveyerNotMoved) return;

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
        const newPos = conveyer.getGlobalPosition(this.gridBase).add(new Vector3(offset * (index - 3), 1.5, 0));
        basepart?.CFrame.Lerp(new CFrame(newPos), 0.1);
    }
}

export default EntitiesHandler;

function swapArrayElements(array: Array<unknown | undefined>, index1: number, index2: number) {
    const temp = array[index1];
    array[index1] = array[index2];
    array[index2] = temp;
}