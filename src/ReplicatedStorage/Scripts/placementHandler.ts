// Services
import { Players, ReplicatedStorage, RunService, Workspace } from "@rbxts/services";
import { TileGrid } from "./gridTile";
import { TileEntity } from "./gridEntities/tileEntity";
import { getLocalPosition, removeAllTileFromAllConnectedTiles } from "./gridEntities/Utils/tileEntityUtils";
import { getTileEntityByCategory, getTileEntityInformation, isInteractable } from "./gridEntities/tileEntityProvider";
import { BLUE, GRID_SIZE, LERP_SPEED, PLACEMENT_RANGE, PLACING_TRANSPARENCY } from "ReplicatedStorage/parameters";
import { getSoundEffect, setRandomPitch, playSoundEffectWithoutStopping, playSoundEffectDuplicated } from "./Utils/playSound";

//Event
const placeTileCheck = ReplicatedStorage.WaitForChild("Events").WaitForChild("placeTileCheck") as RemoteFunction;
const removeTileEvent = ReplicatedStorage.WaitForChild("Events").WaitForChild("removeTile") as RemoteEvent;
const rotateTile = ReplicatedStorage.WaitForChild("Events").WaitForChild("rotateTile") as RemoteEvent;

enum placementType {
    PLACING,
    DESTROYING,
    INTERACTING,
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
    turningArrow: BasePart | undefined;

    lastPos: Vector3 | undefined;
    lastRotation: number | undefined;
    tileGrid: TileGrid | undefined;
    tileName: string | undefined;

    isCurrentltyPlacing: boolean = false;
    isClicking: boolean = false;

    // Bools
    placementStatus = placementType.INTERACTING;

    constructor(gridBase: BasePart) {
        if (!gridBase) error("Grid base not found");
        this.gridBase = gridBase;
        this.mouse = this.player.GetMouse()
        this.placedObjects = this.gridBase.FindFirstChild("PlacedObjects") as Folder
        this.rotation = math.rad(this.gridBase.Orientation.Y)

        this.activateInteracting();
    }

    setTileGrid(tileGrid: TileGrid) {
        this.tileGrid = tileGrid;
    }

    private calculateObjectPos(obj: BasePart): Vector3 | undefined {
        assert(this.currentTile, "Object not found");
        const mouseRay = this.mouse.UnitRay;
        const raycastParameters = new RaycastParams();
        raycastParameters.FilterType = Enum.RaycastFilterType.Exclude
        raycastParameters.FilterDescendantsInstances = [this.gridBase.FindFirstChild("PlacedObjects")!, Players.LocalPlayer.Character!];

        const raycastResult = Workspace.Raycast(mouseRay.Origin, mouseRay.Direction.mul(1000), raycastParameters);
        const localPos = raycastResult!.Position.sub(this.gridBase.Position);

        if (raycastResult) {
            let x = math.floor(localPos.X / GRID_SIZE) * GRID_SIZE;
            const y = this.gridBase.Size.Y / 2 + obj.Size.Y / 2;
            let z = math.floor(localPos.Z / GRID_SIZE) * GRID_SIZE;

            if (this.size && this.size.X % 2 === 1) x += GRID_SIZE / 2;
            if (this.size && this.size.Y % 2 === 1) z += GRID_SIZE / 2;

            const newPos = new Vector3(x, y, z).add(this.gridBase.Position).sub(this.currentTile.PivotOffset.Position)
            if (Players.LocalPlayer.Character!.PrimaryPart!.Position.sub(newPos).Magnitude <= PLACEMENT_RANGE) return newPos;
        }
        return undefined;
    }

    private calculateSize() {
        if (this.currentTile === undefined) return;
        const x = math.round(this.currentTile.Size.X / GRID_SIZE);
        const z = math.round(this.currentTile.Size.Z / GRID_SIZE);
        this.size = new Vector2(x, z);
        if (this.rotation === math.rad(-90) || this.rotation === math.rad(-270)) this.size = new Vector2(z, x);
    }

    private checkPlacement(pos: Vector3): boolean {
        if (this.currentTile === undefined || this.size === undefined) return false;
        const localPos = pos.sub(this.gridBase.Position);
        const x = math.floor(localPos.X / GRID_SIZE) * GRID_SIZE + this.gridBase.Size.X / 2;
        const y = math.floor(localPos.Z / GRID_SIZE) * GRID_SIZE + this.gridBase.Size.Z / 2;

        if (x > this.gridBase.Size.X - math.ceil(this.size.X / 2 - 1) * GRID_SIZE || x <= math.floor(this.size.X / 2 - 1) * GRID_SIZE) return false;
        if (y > this.gridBase.Size.Z - math.ceil(this.size.Y / 2 - 1) * GRID_SIZE || y <= math.floor(this.size.Y / 2 - 1) * GRID_SIZE) return false;

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
                this.setupArrowsPosition(newPos);
            }

            //set target position
            if (newPos !== undefined && newPos !== this.targetPos && this.checkPlacement(newPos) && this.selectionTile !== undefined) {
                this.lastPos = this.targetPos;
                this.targetPos = newPos;
                this.isCurrentltyPlacing = false;

                if (newPos !== this.targetPos) {
                    this.selectionTile.SurfaceColor3 = new Color3(1, 0, 0);
                }
            }

            //lerp object to target position
            if (this.targetPos) {
                this.currentTile.CFrame = this.currentTile.CFrame.Lerp(new CFrame(this.targetPos).mul(CFrame.fromOrientation(0, this.rotation, 0)), LERP_SPEED);
                this.moveArrows()
            }
        }
    }

    setupArrowsPosition(pos: Vector3) {
        this.moveArrows(1, pos);
    }

    moveArrows(speed: number = LERP_SPEED, tilePos: Vector3 = this.targetPos!) {
        if (!this.currentTile) return;

        for (const arrow of this.currentTile.GetChildren()) {
            const arrowPart = arrow as BasePart;
            if (arrow.Name === "red arrow" || arrow.Name === "blue arrow") {
                const rotatedOffset = CFrame.fromOrientation(0, this.rotation, 0).mul(arrowPart.PivotOffset.Position);
                const targetPos = new CFrame(tilePos!).mul(new CFrame(rotatedOffset)).mul(CFrame.Angles(0, this.rotation, 0)).mul(arrowPart.PivotOffset.Rotation);
                arrowPart.CFrame = arrowPart.CFrame.Lerp(targetPos, speed);
            }
        }
    }


    checkPlacementStatus(price: number, playerMoney: NumberValue) {
        if (!this.selectionTile) return;
        if (!this.currentTile) return;
        if (!this.tileGrid) return;

        if (!this.hasEnoughMoney(price, playerMoney)) { this.selectionTile.SurfaceColor3 = new Color3(1, 0, 0); return; }
        const hasTheTileMoved = this.targetPos !== this.lastPos || this.rotation !== this.lastRotation
        if (hasTheTileMoved) {
            this.lastRotation = this.rotation;
            const tile = this.getTileFromBasePart(this.currentTile);
            if (!tile) { this.selectionTile.SurfaceColor3 = new Color3(1, 0, 0); return; };
            if (!this.tileGrid.checkPlacement(tile)) { this.selectionTile.SurfaceColor3 = new Color3(1, 0, 0); return; }
            this.changeCurrentTileShape(tile)
            this.selectionTile.SurfaceColor3 = new Color3(0, 1, 0);
        }
    }

    private changeCurrentTileShape(tile: TileEntity) {
        if (!this.tileGrid) error("TileGrid not found");

        // check the new shape
        this.tileGrid.addTile(tile);
        tile.setAllConnectedNeighboursTileEntity(this.tileGrid);
        const newShape = tile.getNewShape(this.gridBase, this.currentTile);
        removeAllTileFromAllConnectedTiles(tile);
        this.tileGrid.removeTile(tile);
        if (newShape) {
            const lastPos = this.currentTile?.Position;
            this.currentTile?.Destroy();
            this.currentTile = newShape.Clone();
            this.currentTile.Position = lastPos as Vector3;
            this.setupObject();
        }
    }

    private getTileFromBasePart(obj: BasePart): TileEntity | undefined {
        if (!this.targetPos) return;

        const direction = new Vector2(math.round(math.cos(this.rotation as number)), math.round(math.sin(this.rotation as number)));
        const localPos = getLocalPosition(this.targetPos as Vector3, this.gridBase as BasePart);
        const tileInformation = getTileEntityInformation(obj.Name as string);
        const tileEntity = getTileEntityByCategory(tileInformation.category, tileInformation.name, localPos as Vector3, this.size as Vector2, direction, tileInformation.speed as number);
        this.tileName = tileInformation.name;

        return tileEntity;
    }

    hasEnoughMoney(price: number, playerMoney: NumberValue) {
        if (this.selectionTile) {
            return playerMoney.Value >= price
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
        if (this.placementStatus !== placementType.INTERACTING) this.resetMode();
        this.desactivateInteracting();
        this.currentTile = obj.Clone();
        if (!this.currentTile) error("Object not found");

        this.calculateSize();
        this.setupArrows();
        this.placementStatus = placementType.PLACING;

        RunService.BindToRenderStep("place", Enum.RenderPriority.Input.Value, () => { this.moveObj(); this.checkPlacementStatus(price, playerMoney) });
    }

    setupArrows() {
        if (!this.currentTile) return;
        const tileEntity = getTileEntityByCategory(getTileEntityInformation(this.currentTile.Name).category, "test", new Vector3(0, 0, 0), new Vector2(1, 1), new Vector2(1, 0), 1);
        if (!tileEntity) return;

        if (["assembler"].includes(tileEntity.category)) {
            print("implémente ça mon reuf")
        } else {
            this.addDefaultArrows(tileEntity.maxInputs, tileEntity.maxOutputs);
        }
    }

    private addDefaultArrows(input: number, output: number) {
        switch (input) {
            case 4:
                this.addArrow(ArrowType.INPUT, new Vector3(3, 0, 0), -180);
            case 3:
                this.addArrow(ArrowType.INPUT, new Vector3(0, 0, -3), -90);
            case 2:
                this.addArrow(ArrowType.INPUT, new Vector3(0, 0, 3), 90);
            case 1:
                this.addArrow(ArrowType.INPUT, new Vector3(-3, 0, 0), 0);
                break;
            default:
                break
        }

        switch (output) {
            case 3:
                this.addArrow(ArrowType.OUTPUT, new Vector3(0, 0, -3), 90);
            case 2:
                this.addArrow(ArrowType.OUTPUT, new Vector3(0, 0, 3), -90);
            case 1:
                this.addArrow(ArrowType.OUTPUT, new Vector3(3, 0, 0), 0);
                break;
            default:
                break
        }

    }

    private addArrow(arrowType: ArrowType, relativePosition: Vector3, orientationDeg: number) {
        const inputArrowPrefab = ReplicatedStorage.FindFirstChild("prefab")!.FindFirstChild("red arrow")! as BasePart;
        const outputArrowPrefab = ReplicatedStorage.FindFirstChild("prefab")!.FindFirstChild("blue arrow")! as BasePart;

        const arrow = arrowType === ArrowType.INPUT ? inputArrowPrefab.Clone() : outputArrowPrefab.Clone();

        let offsetPosition = CFrame.fromOrientation(0, this.rotation, 0).mul(new Vector3((this.size!.X - 1) * GRID_SIZE / 2, 0, (this.size!.Y - 1) * GRID_SIZE / 2))
        if (this.size!.X !== this.size!.Y) {
            switch (this.rotation) {
                case math.rad(0):
                    if (arrowType === ArrowType.INPUT) offsetPosition = offsetPosition.add(new Vector3(-GRID_SIZE, 0, 0));
                    break;
                case math.rad(-90):
                    if (arrowType === ArrowType.OUTPUT) offsetPosition = offsetPosition.add(new Vector3(GRID_SIZE, 0, 0));
                    break;
                case math.rad(-180):
                    if (arrowType === ArrowType.OUTPUT) offsetPosition = offsetPosition.add(new Vector3(GRID_SIZE, 0, 0));
                    break;
                case math.rad(-270):
                    if (arrowType === ArrowType.INPUT) offsetPosition = offsetPosition.add(new Vector3(-GRID_SIZE, 0, 0));
                    break;
            }
        }

        arrow.PivotOffset = new CFrame(relativePosition.add(offsetPosition)).mul(CFrame.fromEulerAnglesYXZ(0, math.rad(orientationDeg), math.rad(-90)));
        arrow.Position = this.currentTile!.Position.add(arrow.PivotOffset.Position);
        arrow.Parent = this.currentTile;
    }

    activateInteracting() {
        this.selectionTile = ReplicatedStorage.FindFirstChild("prefab")?.FindFirstChild("selectionInteractionTile")?.Clone() as SelectionBox;
        if (!this.selectionTile) error("Selection tile not found");
        RunService.BindToRenderStep("inspect", Enum.RenderPriority.Input.Value, () => { this.setupInteracting() });
    }

    resetMode() {
        if (this.placementStatus === placementType.INTERACTING) return;
        RunService.UnbindFromRenderStep("place");
        RunService.UnbindFromRenderStep("destroy");
        this.targetPos = undefined;
        this.size = undefined;
        if (this.placementStatus === placementType.PLACING) this.currentTile?.Destroy();
        this.resetSelectionTile();
        this.currentTile = undefined;
        this.lastPos = undefined;
        this.placementStatus = placementType.INTERACTING;
        this.turningArrow?.Destroy();
        this.turningArrow = undefined;

        this.activateInteracting()
    }

    desactivateInteracting() {
        RunService.UnbindFromRenderStep("inspect");
        this.currentTile = undefined;
        this.resetSelectionTile();
        this.turningArrow?.Destroy();
        this.turningArrow = undefined;
    }

    placeObject() {
        if (this.currentTile === undefined || this.placementStatus !== placementType.PLACING) return;
        if (this.selectionTile && this.selectionTile.SurfaceColor3 === new Color3(1, 0, 0)) {
            if (!this.isClicking) playSoundEffectWithoutStopping(getSoundEffect("error"));
        }
        else if (!this.isCurrentltyPlacing) {
            this.isCurrentltyPlacing = true;
            placeTileCheck.InvokeServer(this.tileName, this.targetPos, -this.rotation, this.size, this.gridBase)
            setRandomPitch(playSoundEffectDuplicated(getSoundEffect("placement")), 0.97, 1.03);
        }
    }

    setupDestroying() {
        if (this.placementStatus !== placementType.DESTROYING) return;

        const hit = getTileFromRay(this.gridBase);

        if (hit) {
            if (hit !== this.currentTile) {
                this.currentTile = hit;
                this.setupDestroySelectionBox(hit);
            }
        } else {
            this.currentTile = undefined;
            this.resetSelectionTile();
        }
    }

    setupInteracting() {
        if (this.placementStatus !== placementType.INTERACTING) this.resetMode();

        const hit = getTileFromRay(this.gridBase);

        if (hit && hit.Parent === this.placedObjects) {
            if (hit === this.currentTile) return;

            this.currentTile = hit;
            this.setupInteractingBox();
        } else {
            this.resetSelectionTile();
            this.currentTile = undefined;
        }
        this.setupTurningArrow();
    }

    setupTurningArrow() {
        if (!this.turningArrow) this.turningArrow = ReplicatedStorage.FindFirstChild("prefab")!.FindFirstChild("rotate arrow")!.Clone() as BasePart;
        this.turningArrow.Parent = this.currentTile;

        if (!this.currentTile) return;
        this.turningArrow.Position = this.currentTile.Position.add(Vector3.yAxis.mul(this.currentTile.Size.Y / 2 + 0.3));
    }

    setupInteractingBox() {
        if (this.selectionTile === undefined) error("Selection tile not initialized");
        this.selectionTile.Visible = true;
        this.selectionTile.Parent = this.currentTile;
        this.selectionTile.Adornee = this.currentTile;
        this.selectionTile.Color3 = BLUE;
        this.selectionTile.Transparency = 0.5;

        const tileInfo = getTileEntityInformation(this.currentTile!.Name);
        if (!tileInfo) return;
        if (isInteractable(tileInfo.category)) {
            this.selectionTile.Transparency = 0.2
            this.selectionTile.Color3 = new Color3(1, 1, 1)
        };
    }

    destroyObject() {
        if (this.currentTile === undefined || this.placementStatus !== placementType.DESTROYING || this.currentTile.Position === this.lastPos) return;
        this.lastPos = this.currentTile.Position;
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
        if (this.placementStatus === placementType.DESTROYING) return this.resetMode();
        if (this.placementStatus === placementType.PLACING) this.resetMode();
        this.desactivateInteracting();
        this.placementStatus = placementType.DESTROYING;

        this.selectionTile = ReplicatedStorage.FindFirstChild("prefab")?.FindFirstChild("selectionTile")?.Clone() as SelectionBox;
        this.selectionTile.SurfaceColor3 = new Color3(1, 0, 0);
        if (!this.selectionTile) error("Selection tile not found");

        RunService.BindToRenderStep("destroy", Enum.RenderPriority.Input.Value, () => { this.setupDestroying() });
    }


    rotate() {
        if (this.placementStatus === placementType.INTERACTING) {
            if (!this.currentTile) return;
            rotateTile.FireServer(this.currentTile.Position);
        } else {
            if (this.size === undefined) return;
            this.lastRotation = this.rotation;
            this.rotation -= math.pi / 2;
            if (this.rotation === -math.pi * 2) {
                this.rotation = 0;
            }
            this.size = new Vector2(this.size.Y, this.size.X);
        }

    }
}

/**
 * @returns the last hit part before the gridBase
 */
function getTileFromRay(gridBase: BasePart): BasePart | undefined {
    const mouseRay = Players.LocalPlayer.GetMouse().UnitRay;
    const raycastParameters = new RaycastParams();
    raycastParameters.FilterType = Enum.RaycastFilterType.Include
    raycastParameters.FilterDescendantsInstances = [gridBase.FindFirstChild("PlacedObjects")!];

    const raycastResult = Workspace.Raycast(mouseRay.Origin, mouseRay.Direction.mul(1000), raycastParameters);
    if (raycastResult?.Instance?.Parent === gridBase.FindFirstChild("PlacedObjects")) {
        const isTileTooFarAway = raycastResult!.Instance.Position.sub(Players.LocalPlayer.Character!.PrimaryPart!.Position).Magnitude > PLACEMENT_RANGE
        if (isTileTooFarAway) return undefined;
        return raycastResult?.Instance as BasePart;
    }
    return undefined;
}

enum ArrowType {
    INPUT,
    OUTPUT,
}

export { PlacementHandler, placementType, getTileFromRay };