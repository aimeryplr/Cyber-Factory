// Services
import { Players, ReplicatedStorage, RunService, Workspace } from "@rbxts/services";

//Event
const placeTileCheck = ReplicatedStorage.WaitForChild("Events").WaitForChild("placeTileCheck") as RemoteFunction;

// Parameters
const GRID_SIZE = 3;
const LERP_SPEED = 0.5;
const PLACING_TRANSPARENCY = 0.3;

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
    isPlacing = false;

    constructor(gridBase: BasePart) {
        if (!gridBase) error("Grid base not found");
        this.gridBase = gridBase;
        this.mouse = this.player.GetMouse()
        this.placedObjects = this.gridBase.FindFirstChild("PlacedObjects") as Folder
        this.rotation = math.rad(this.gridBase.Orientation.Y)
    }

    private calculateObjectPos(obj: BasePart): Vector3 | undefined {
        print
        const plotOffset = new Vector2(this.gridBase.Position.X % GRID_SIZE, this.gridBase.Position.Z % GRID_SIZE);

        const mouseRay = this.mouse.UnitRay;
        const castRay = new Ray(mouseRay.Origin, mouseRay.Direction.mul(1000));
        const ignoreList = [obj];
        const [hit, position] = Workspace.FindPartOnRayWithIgnoreList(castRay, ignoreList);

        if (hit === this.gridBase) {
            let x = math.floor((position.X - plotOffset.X) / GRID_SIZE) * GRID_SIZE + plotOffset.X;
            const y = this.gridBase.Size.Y / 2 + this.gridBase.Position.Y + obj.Size.Y / 2;
            let z = math.floor((position.Z - plotOffset.Y) / GRID_SIZE) * GRID_SIZE + plotOffset.Y;
            if (this.size && this.size.X % 2 === 1) x += GRID_SIZE / 2;
            if (this.size && this.size.Y % 2 === 1) z += GRID_SIZE / 2;
            return new Vector3(x, y, z);
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
        const x = math.floor((pos.X - this.gridBase.Position.X) / GRID_SIZE) * GRID_SIZE + this.gridBase.Size.X / 2;
        const y = math.floor((pos.Z - this.gridBase.Position.Z) / GRID_SIZE) * GRID_SIZE + this.gridBase.Size.Z / 2;

        if (x >= this.gridBase.Size.X - math.ceil(this.size.X / 2 - 1) * GRID_SIZE || x < math.floor(this.size.X / 2) * GRID_SIZE) return false;
        if (y >= this.gridBase.Size.Z - math.ceil(this.size.Y / 2 - 1) * GRID_SIZE || y < math.floor(this.size.Y / 2) * GRID_SIZE) return false;

        return true;
    }

    isPlaceable(): boolean {
        if (this.currentTile === undefined) return false;
        return Workspace.GetPartsInPart(this.currentTile).size() === 0;
    }

    private moveObj() {
        if (this.currentTile) {
            const newPos = this.calculateObjectPos(this.currentTile);
            if (newPos !== undefined && this.targetPos === undefined) {
                this.currentTile.Position = newPos;
            }

            //set target position
            if (newPos !== undefined && this.checkPlacement(newPos) && this.selectionTile !== undefined) {
                this.targetPos = newPos;
            }

            //show if placement is possible with seleciton box
            if (this.selectionTile !== undefined) {
                this.selectionTile.SurfaceColor3 = this.isPlaceable() ? new Color3(0, 1, 0) :new Color3(1, 0, 0);
            }

            //lerp object to target position
            if (this.targetPos !== undefined) {
                this.currentTile.CFrame = this.currentTile.CFrame.Lerp(new CFrame(this.targetPos).mul(CFrame.fromOrientation(0, this.rotation, 0)), LERP_SPEED);
            }
        }
    }

    private setupObject() {
        if (this.currentTile === undefined) return;

        //setup object
        this.currentTile.Anchored = true;
        this.currentTile.CanCollide = false;
        this.currentTile.Parent = this.placedObjects;
        this.currentTile.Transparency = PLACING_TRANSPARENCY;

        //add selectionBox
        this.selectionTile = ReplicatedStorage.FindFirstChild("prefab")?.FindFirstChild("selectionTile")?.Clone() as SelectionBox;
        if (this.selectionTile === undefined) return;

        this.selectionTile.Parent = this.currentTile;
        this.selectionTile.Adornee = this.currentTile;
    }

    activatePlacing(obj: BasePart) {
        this.currentTile = obj.Clone();
        if(!this.currentTile) error("Object not found");

        this.calculateSize();
        this.isPlacing = true;
        this.setupObject();
        
        RunService.BindToRenderStep("Input", Enum.RenderPriority.Input.Value, () => {this.moveObj()});
    }

    resetPlacing() {
        this.isPlacing = false;
        RunService.UnbindFromRenderStep("Input");
        this.rotation = 0;
        this.targetPos = undefined;
        this.size = undefined;
    }

    placeObject() {
        if (this.currentTile === undefined || !this.isPlacing) return;
        if (placeTileCheck.InvokeServer(this.currentTile.Name, this.targetPos, -this.rotation , this.size, this.gridBase)) {
            this.desactivatePlacing();
        }
    }

    desactivatePlacing() {
        if (this.currentTile === undefined || !this.isPlacing) return;
        this.currentTile.Destroy();
        this.resetPlacing();
    }

    rotate() {
        if (this.isPlacing === false) return;
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

export { PlacementHandler, setupObject, GRID_SIZE };