// Services
import { Players, ReplicatedStorage, RunService, UserInputService, TweenService, Workspace } from "@rbxts/services";

// Parameters
const GRID_SIZE = 3;
const LERP_SPEED = 0.5;
const PLACING_TRANSPARENCY = 0.3;

class PlacementHandler {
    player: Player;
    mouse: Mouse;

    // Grid Parameters
    gridBase: BasePart;
    placedObjects: Folder;

    // Object values
    currentTile: BasePart | undefined;
    size: Vector2 | undefined;
    rotation: number;
    targetPos: Vector3 | undefined;

    // Bools
    isPlacing = false;

    constructor(player: Player, gridBase: BasePart) {
        this.player = player;
        this.gridBase = gridBase;
        this.mouse = player.GetMouse()
        this.placedObjects = this.gridBase.FindFirstChild("PlacedObjects") as Folder
        this.rotation = math.rad(this.gridBase.Orientation.Y)
    }

    calculateObjectPos(obj: BasePart): Vector3 | undefined {
        const plotOffset = new Vector2(this.gridBase.Position.X % GRID_SIZE, this.gridBase.Position.Z % GRID_SIZE);

        const mouseRay = this.mouse.UnitRay;
        const castRay = new Ray(mouseRay.Origin, mouseRay.Direction.mul(1000));
        const ignoreList = [obj];
        const [hit, position] = Workspace.FindPartOnRayWithIgnoreList(castRay, ignoreList);

        if (hit === this.gridBase) {
            let x = math.floor((position.X - plotOffset.X) / GRID_SIZE) * GRID_SIZE + plotOffset.X;
            const y = 2 * this.gridBase.Size.Y + this.gridBase.Position.Y;
            let z = math.floor((position.Z - plotOffset.Y) / GRID_SIZE) * GRID_SIZE + plotOffset.Y;
            if (this.size && this.size.X % 2 === 1) x += GRID_SIZE / 2;
            if (this.size && this.size.Y % 2 === 1) z += GRID_SIZE / 2;
            return new Vector3(x, y, z);
        }
        return undefined;
    }

    calculateSize() {
        if (this.currentTile === undefined) return;
        const x = math.floor(this.currentTile.Size.X / GRID_SIZE);
        const z = math.floor(this.currentTile.Size.Z / GRID_SIZE);
        this.size = new Vector2(x, z);
    }

    checkPlacement(pos: Vector3): boolean {
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

    moveObj() {
        if (this.currentTile) {
            const newPos = this.calculateObjectPos(this.currentTile);
            if (newPos !== undefined && this.checkPlacement(newPos)) {
                this.targetPos = newPos;
            }
            if (this.targetPos !== undefined) {
                this.currentTile.CFrame = this.currentTile.CFrame.Lerp(new CFrame(this.targetPos).mul(CFrame.fromOrientation(0, this.rotation, 0)), LERP_SPEED);
            }
        }
    }

    setupObject() {
        if (this.currentTile === undefined) return;
        this.currentTile.Anchored = true;
        this.currentTile.CanCollide = false;
        this.currentTile.Parent = this.placedObjects;
        this.currentTile.Transparency = PLACING_TRANSPARENCY;
    }

    activatePlacing(obj: BasePart) {
        this.currentTile = obj.Clone();
        if (this.currentTile !== undefined) {
            this.calculateSize();
            this.isPlacing = true;
            this.setupObject();
            
            RunService.BindToRenderStep("Input", Enum.RenderPriority.Input.Value, () => {this.moveObj()});
        }
    }

    deactivatePlacing() {
        if (this.currentTile === undefined) return;
        this.isPlacing = false;
        RunService.UnbindFromRenderStep("Input");
        this.rotation = 0;
        this.currentTile.CanCollide = true;
        this.currentTile.Transparency = 0;
    }

    rotate() {
        if (this.size === undefined) return;
        this.rotation += math.pi / 2;
        if (this.rotation === math.pi * 2) {
            this.rotation = 0;
        }
        this.size = new Vector2(this.size.Y, this.size.X);
    }
}

/*
UserInputService.InputBegan.Connect((input, gameProcessedEvent) => {
    if (!gameProcessedEvent) {
        if (input.UserInputType === terminateKey && isPlaceable()) {
            deactivatePlacing();
        }
        if (input.KeyCode === rotateKey && isPlacing) {
            rotate();
        }
        if (input.KeyCode === Enum.KeyCode.E && !isPlacing) {
            const conveyer = ReplicatedStorage.FindFirstChild("Entities")?.FindFirstChild("GridEntities")?.FindFirstChild("conveyer");
            if (conveyer && conveyer.IsA("BasePart")) {
                activatePlacing(conveyer);
            }
        }
    }
});
*/