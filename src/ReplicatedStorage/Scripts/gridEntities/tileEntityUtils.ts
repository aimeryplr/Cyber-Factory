import { ReplicatedStorage } from "@rbxts/services";
import { TileEntity } from "./tileEntity";
import { GRID_SIZE } from "ReplicatedStorage/parameters";


/**
 * find the part in the entities folder in the replicated storage
 * @param name part name
 * @returns the part found or error
 */
function findBasepartByName(name: string, category?: string): BasePart {
    if (category) {
        const tileObj = ReplicatedStorage.FindFirstChild("GridEntities")?.FindFirstChild(category)?.FindFirstChild(name) as BasePart;
        if (!tileObj) {
            error(`gridEntity ${name} not found`);
        }
        return tileObj;
    } else {
        const categories = ReplicatedStorage.FindFirstChild("GridEntities")?.GetChildren()
        if (!categories) error(`no categories found`);

        for (const category of categories) {
            const tileObj = category.FindFirstChild(name) as BasePart;
            if (tileObj !== undefined) {
                return tileObj;
            }
        }
    }
    error(`tileObj ${name} not found`);
}

function objSizeToTileSize(size: Vector3 | Vector2): Vector2 {
    if (size instanceof Vector3) size = new Vector2((size as Vector3).X, (size as Vector3).Z);
    return new Vector2(math.round(size.X / GRID_SIZE), math.round(size.Y / GRID_SIZE));
}

/**
 * removes all connections from the tileEntity
 */
function removeAllTileFromAllConnectedTiles(tileEntity: TileEntity): void {
    tileEntity.inputTiles.forEach((inputTile) => {
        inputTile.removeConnection(tileEntity);
    });

    tileEntity.outputTiles.forEach((outputTiles) => {
        outputTiles.removeConnection(tileEntity);
    });
}

function removeConectedTiles(tileEntity: TileEntity) {
    removeAllTileFromAllConnectedTiles(tileEntity);
    tileEntity.outputTiles.clear();
    tileEntity.inputTiles.clear();
}

function connectTileEntityToAllInputsAndOutputs(tileEntity: TileEntity): void {
    tileEntity.inputTiles.forEach((inputTile) => {
        inputTile.outputTiles.push(tileEntity);
    })

    tileEntity.outputTiles.forEach((outputTile) => {
        outputTile.inputTiles.push(tileEntity);
    })
}

function getGlobalPosition(position: Vector3, gridBase: BasePart): Vector3 {
    return position.add(gridBase.Position);
}

function getLocalPosition(position: Vector3, gridBase: BasePart): Vector3 {
    return position.sub(gridBase.Position);
}

export function getTileEntityNames() {
    const entities = ReplicatedStorage.FindFirstChild("GridEntities");
    if (!entities) error("no entities found");

    const tileEntityNames = new Array<string>();
    for (const category of entities.GetChildren()) {
        for (const tileEntity of category.GetChildren()) {
            tileEntityNames.push(tileEntity.Name);
        }
    }
    return tileEntityNames;
}

export { findBasepartByName, objSizeToTileSize, removeAllTileFromAllConnectedTiles, connectTileEntityToAllInputsAndOutputs, getGlobalPosition, getLocalPosition, removeConectedTiles };