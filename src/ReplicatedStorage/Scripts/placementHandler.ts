// Services
import { Players, ReplicatedStorage, RunService, Workspace } from "@rbxts/services";

//Event
const placeTileCheck = ReplicatedStorage.WaitForChild("Events").WaitForChild("placeTileCheck") as RemoteFunction;
const removeTileEvent = ReplicatedStorage.WaitForChild("Events").WaitForChild("removeTile") as RemoteEvent;

// Parameters
const GRID_SIZE = 3;
const LERP_SPEED = 0.5;
const PLACING_TRANSPARENCY = 0.3;

enum placementType {
    PLACING,
    DESTROYING,
    NONE
} 

class PlacementHandler {
    player: Player = Players.LocalPlayer;
    mouse: Mouse;

    // Grid Parameters
    gridBase: BasePart;
    placedObjects: Folder;

    // Object values
    currentTile: BasePart | undefined;
    size: Vector2 | undefined;
    rotation: number;
    targetPos: Vector3 | undefined;
    selectionTile: SelectionBox | undefined;

    // Bools
    placementStatus = placementType.NONE;

    constructor(gridBase: BasePart) {
        if (!gridBase) error("Grid base not found");
        this.gridBase = gridBase;
        this.mouse = this.player.GetMouse()
        this.placedObjects = this.gridBase.FindFirstChild("PlacedObjects") as Folder
        this.rotation = math.rad(this.gridBase.Orientation.Y)
    }

    private calculateObjectPos(obj: BasePart): Vector3 | undefined {
        const mouseRay = this.mouse.UnitRay;
        const castRay = new Ray(mouseRay.Origin, mouseRay.Direction.mul(1000));
        const ignoreList = [obj];
        const [hit, position] = Workspace.FindPartOnRayWithIgnoreList(castRay, ignoreList);
        const localPos = position.sub(this.gridBase.Position);

        if (hit === this.gridBase) {
            let x = math.floor((localPos.X + GRID_SIZE / 2) / GRID_SIZE) * GRID_SIZE;
            const y = this.gridBase.Size.Y / 2 + obj.Size.Y / 2;
            let z = math.floor((localPos.Z + GRID_SIZE / 2) / GRID_SIZE) * GRID_SIZE;
            
            if (this.size && this.size.X % 2 === 0) x -= GRID_SIZE / 2;
            if (this.size && this.size.Y % 2 === 0) z -= GRID_SIZE / 2;

            return new Vector3(x, y, z).add(this.gridBase.Position);
        }
        return undefined;
    }

    private calculateSize() {
        if (this.currentTile === undefined) return;
        const x = math.round(this.currentTile.Size.X / GRID_SIZE);
        const z = math.round(this.currentTile.Size.Z / GRID_SIZE);
        this.size = new Vector2(x, z);
    }

    private checkPlacement(pos: Vector3): boolean {
        if (this.currentTile === undefined || this.size === undefined) return false;
        const localPos = pos.sub(this.gridBase.Position);
        const x = math.floor(localPos.X / GRID_SIZE) * GRID_SIZE + this.gridBase.Size.X / 2;
        const y = math.floor(localPos.Z / GRID_SIZE) * GRID_SIZE + this.gridBase.Size.Z / 2;

        if (x >= this.gridBase.Size.X - math.ceil(this.size.X / 2 - 1) * GRID_SIZE || x < math.floor(this.size.X / 2 - 1) * GRID_SIZE) return false;
        if (y >= this.gridBase.Size.Z - math.ceil(this.size.Y / 2 - 1) * GRID_SIZE || y < math.floor(this.size.Y / 2 - 1) * GRID_SIZE) return false;

        return true;
    }

    isPlaceable(): boolean {
        if (this.currentTile === undefined) return false;
        return Workspace.GetPartsInPart(this.currentTile).size() === 0;
    }

    private moveObj() {
        if (this.currentTile) {
            const newPos = this.calculateObjectPos(this.currentTile);
            // init position
            if (newPos !== undefined && this.targetPos === undefined) {
                this.currentTile.Position = newPos;
                this.setupObject();
            }
            
            //set target position
            if (newPos !== undefined && this.checkPlacement(newPos) && this.selectionTile !== undefined) {
                this.targetPos = newPos;
            }

            //show if placement is possible with seleciton box
            if (this.selectionTile !== undefined) {
                this.selectionTile.SurfaceColor3 = new Color3(0, 1, 0);
            }

            //lerp object to target position
            if (this.targetPos !== undefined) {
                this.currentTile.CFrame = this.currentTile.CFrame.Lerp(new CFrame(this.targetPos).mul(CFrame.fromOrientation(0, this.rotation, 0)), LERP_SPEED);
            }
        }
    }

    updateMoneyCheck(price: number, playerMoney: NumberValue) {
        if (this.selectionTile) {
            this.selectionTile.SurfaceColor3 = playerMoney.Value >= price ? new Color3(0, 1, 0) : new Color3(1, 0, 0);
        }
    }

    private setupObject() {
        if (this.currentTile === undefined) error("Object not found");

        //setup object
        this.currentTile.Anchored = true;
        this.currentTile.CanCollide = false;
        this.currentTile.Parent = this.placedObjects;
        this.currentTile.Transparency = PLACING_TRANSPARENCY;
        this.currentTile.Orientation = new Vector3(0, math.deg(this.rotation), 0);

        this.selectionTile = ReplicatedStorage.FindFirstChild("prefab")?.FindFirstChild("selectionTile")?.Clone() as SelectionBox;
        if (!this.selectionTile) return;

        this.selectionTile.Parent = this.currentTile;
        this.selectionTile.Adornee = this.currentTile;
    }

    activatePlacing(obj: BasePart, price: number, playerMoney: NumberValue) {
        if (this.placementStatus !== placementType.NONE) this.resetMode();
        this.currentTile = obj.Clone();
        if(!this.currentTile) error("Object not found");

        this.calculateSize();
        this.placementStatus = placementType.PLACING;
        
        RunService.BindToRenderStep("place", Enum.RenderPriority.Input.Value, () => {this.moveObj(); this.updateMoneyCheck(price, playerMoney)});
    }

    resetMode() {
        RunService.UnbindFromRenderStep("place");
        RunService.UnbindFromRenderStep("destroy");
        this.targetPos = undefined;
        this.size = undefined;
        if (this.placementStatus === placementType.PLACING) this.currentTile?.Destroy();
        this.resetSelectionTile();
        this.currentTile = undefined;
        this.placementStatus = placementType.NONE;
    }

    placeObject() {
        if (this.currentTile === undefined || this.placementStatus !== placementType.PLACING) return;
        placeTileCheck.InvokeServer(this.currentTile.Name, this.targetPos, -this.rotation , this.size, this.gridBase)
    }

    setupDestroying() {
        if (this.placementStatus !== placementType.DESTROYING) return;

        const mouseRay = this.mouse.UnitRay;
        const character = Players.LocalPlayer.Character;
        assert(character, "Character not found");

        const raycastParameters = new RaycastParams();
        raycastParameters.FilterType = Enum.RaycastFilterType.Exclude;
        raycastParameters.FilterDescendantsInstances = [character];

        const hit = Workspace.Raycast(mouseRay.Origin, mouseRay.Direction.mul(100), raycastParameters);

        if (hit && hit.Instance && hit.Instance.Parent === this.placedObjects) {
            if (hit.Instance !== this.currentTile) {
                this.currentTile = hit.Instance;
                this.setupDestroySelectionBox(hit.Instance);
            }
        } else {
            this.currentTile = undefined;
            this.resetSelectionTile();
        }
    }

    destroyObject() {
        if (this.currentTile === undefined || this.placementStatus !== placementType.DESTROYING) return;
        this.resetSelectionTile();
        removeTileEvent.FireServer(this.currentTile);
    }

    resetSelectionTile() {
        if (this.selectionTile === undefined) error("Selection tile not initialized");
        this.selectionTile.Visible = false;
        this.selectionTile.Parent = undefined;
        this.selectionTile.Adornee = undefined;
    }

    setupDestroySelectionBox(hit: BasePart) {
        if (this.selectionTile === undefined) error("Selection tile not initialized");
        this.selectionTile.Visible = true;
        this.selectionTile.Parent = hit;
        this.selectionTile.Adornee = hit;
    }

    activateDestroying() {
        if (this.placementStatus === placementType.DESTROYING) return;
        if (this.placementStatus === placementType.PLACING) this.resetMode();
        this.placementStatus = placementType.DESTROYING;

        this.selectionTile = ReplicatedStorage.FindFirstChild("prefab")?.FindFirstChild("selectionTile")?.Clone() as SelectionBox;
        this.selectionTile.SurfaceColor3 = new Color3(1, 0, 0);
        if (!this.selectionTile) error("Selection tile not found");

        RunService.BindToRenderStep("destroy", Enum.RenderPriority.Input.Value, () => {this.setupDestroying()});
    }


    rotate() {
        if (this.placementStatus === placementType.NONE) return;
        if (this.size === undefined) return;
        this.rotation -= math.pi / 2;
        if (this.rotation === -math.pi * 2) {
            this.rotation = 0;
        }
        this.size = new Vector2(this.size.Y, this.size.X);
    }
}

/**
 * Setup the object in the grid
 * @param pos position in global
 * @param orientation in radians
 * @returns the object
*/
function setupObject(obj: BasePart, pos: Vector3, orientation: number, gridBase: BasePart): BasePart {
    const newObject = obj.Clone();
    newObject.Position = pos;
    newObject.Orientation = new Vector3(0, -math.deg(orientation), 0);
    newObject.Anchored = true;
    newObject.CanCollide = true;
    newObject.Parent = gridBase.FindFirstChild("PlacedObjects")
    return newObject;
}

/**
 * @returns the last hit part before the gridBase
 */
function getTileFromRay(gridBase: BasePart): BasePart | undefined {
    const range = 30;

    const mouseRay = Players.LocalPlayer.GetMouse().UnitRay;
    const raycastParameters = new RaycastParams();
    raycastParameters.FilterDescendantsInstances = [Players.LocalPlayer.Character!]

    const raycastResult = Workspace.Raycast(mouseRay.Origin, mouseRay.Direction.mul(range), raycastParameters);
    if (raycastResult?.Instance?.Parent === gridBase.FindFirstChild("PlacedObjects")) {
        return raycastResult?.Instance as BasePart;
    }
    return undefined;
}

export { PlacementHandler, setupObject, GRID_SIZE, placementType, getTileFromRay };