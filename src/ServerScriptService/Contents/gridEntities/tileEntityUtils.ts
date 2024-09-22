import { ReplicatedStorage } from "@rbxts/services";
import { GRID_SIZE } from "ReplicatedStorage/Scripts/placementHandler";


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

function objSizeToTileSize(size: Vector3 | Vector2) {
    if (size instanceof Vector3) size = new Vector2((size as Vector3).X, (size as Vector3).Z);
    return new Vector2(math.round(size.X / GRID_SIZE), math.round(size.Y / GRID_SIZE));
}

export { findBasepartByName, objSizeToTileSize };