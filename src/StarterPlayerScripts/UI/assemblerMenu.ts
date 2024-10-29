import { InteractionMenu } from "./InteractionMenu";
import { entitiesList } from "ReplicatedStorage/Scripts/Entities/EntitiesList";
import { HttpService, ReplicatedStorage, RunService, TweenService } from "@rbxts/services";
import { decodeTile } from "ReplicatedStorage/Scripts/gridTileUtils";
import Assembler from "ReplicatedStorage/Scripts/gridEntities/tileEntitiesChilds/assembler";
import { Component, EntityType } from "ReplicatedStorage/Scripts/Entities/entity";
import { getImage } from "./imageUtils";

const changeCrafterOrAssemblerCraft = ReplicatedStorage.WaitForChild("Events").WaitForChild("changeCrafterOrAssemblerCraft") as RemoteEvent;
const getTileRemoteFunction = ReplicatedStorage.WaitForChild("Events").WaitForChild("getTile") as RemoteFunction;

class AssemblerMenu implements InteractionMenu {
    player: Player;
    tileEntity: Assembler | undefined;
    menu: assemblerMenu;
    private timeCrafterAdded: number | undefined;

    private barTween: Tween | undefined;

    constructor(player: Player) {
        this.player = player;
        this.menu = player.WaitForChild("PlayerGui")!.WaitForChild("ScreenGui")!.WaitForChild("assemblerMenu") as assemblerMenu;
    }

    setTileEntity(assembler: Assembler): void {
        if (this.tileEntity?.position === assembler.position && this.tileEntity.currentCraft?.name === assembler.currentCraft?.name) return;
        this.tileEntity = assembler;

        this.timeCrafterAdded = tick();
        this.setupMenu();
    }

    public setupMenu(): void {
        if (!this.tileEntity) return;
        this.loadCraftList();

        if (this.tileEntity.currentCraft) {
            (this.menu.searchCraft.FindFirstChild(this.tileEntity.currentCraft.name) as TextButton)!.BorderSizePixel = 4;
            this.setupCraft(this.tileEntity.currentCraft);
            this.setupProgressBar();
        }

        this.setupClose();

        if (!this.tileEntity.currentCraft) { this.menu.craft.Visible = false; return; }
    }

    setupClose() {
        this.menu.toptop.close.MouseButton1Click.Connect(() => {
            this.hide();
        })
    }

    loadCraftList() {
        const componentPrefab = ReplicatedStorage.FindFirstChild("prefab")?.FindFirstChild("UI")?.FindFirstChild("component") as TextButton;
        for (const child of this.menu.searchCraft.GetChildren()) {
            if (child.IsA("TextButton")) child.Destroy();
        }

        const components = entitiesList
        for (const [componentName, component] of components) {
            if (component.type !== EntityType.MODULE) continue;

            const newComponent = componentPrefab.Clone();
            newComponent.Name = componentName;
            (newComponent.FindFirstChild("itemName")! as TextLabel).Text = componentName;
            (newComponent.FindFirstChild("itemImage")! as ImageLabel).Image = getImage(component);
            (newComponent.FindFirstChild("price")!.FindFirstChild("price")! as TextLabel).Text = tostring(component.price);
            newComponent.Parent = this.menu.searchCraft;

            newComponent.MouseButton1Click.Connect(() => {
                if (!this.tileEntity) return;
                if (this.tileEntity.currentCraft && this.tileEntity.currentCraft.name === componentName) return;

                this.setupCurrentComponent(entitiesList.get(componentName) as Component);
            });
        }
    }

    setupCurrentComponent(component: Component): void {
        this.menu.craft.Visible = true;
        this.removeBorder();
        (this.menu.searchCraft.FindFirstChild(component.name) as TextButton)!.BorderSizePixel = 4;

        this.setupCraft(component);

        changeCrafterOrAssemblerCraft.FireServer(this.tileEntity!.position, component.name);
        while (this.tileEntity?.currentCraft?.name !== component.name) {
            this.tileEntity = decodeTile(HttpService.JSONDecode(getTileRemoteFunction.InvokeServer(this.tileEntity!.position))) as Assembler;
            wait(0.1);
        }
        this.timeCrafterAdded = tick();

        this.setupProgressBar();
    }

    setupCraft(component: Component): void {
        const resourceFrame = this.menu.craft.progression["1itemIn"]

        this.menu.craft.itemName.Text = component.name;
        this.menu.craft.itemName.price.TextLabel.Text = component.price as unknown as string;
        this.menu.craft.progression["3itemOut"].Image = getImage(component);

        let i = 0;
        for (const [resource, quantity] of component.buildRessources) {
            const componentInImg = entitiesList.get(resource);
            const resourceImage = resourceFrame.GetChildren()[i] as ImageLabel;
            resourceImage.Image = getImage(componentInImg);
            resourceImage.Name = resource;
            i++;
        }
        this.menu.craft.speed.Text = component.speed + "/s";
    }

    removeBorder() {
        for (const child of this.menu.searchCraft.GetChildren()) {
            if (!child.IsA("TextButton")) continue;
            child.BorderSizePixel = 0;
        }
    }

    private setupProgressBar(): void {
        const progression = this.menu.craft.progression;
        const timeToFill = 60 / this.tileEntity!.speed;
        const calculatedProgression = this.tileEntity!.lastProgress + ((tick() - this.timeCrafterAdded!) % timeToFill) / timeToFill

        const barTweenInfo = new TweenInfo(timeToFill * (1 - calculatedProgression), Enum.EasingStyle.Linear, Enum.EasingDirection.InOut);
        progression["2progressionBar"].bar.Size = new UDim2(calculatedProgression, 0, 1, 0);
        const tween = TweenService.Create(progression["2progressionBar"].bar, barTweenInfo, { Size: new UDim2(1, 0, 1, 0) });
        tween.Play();

        tween.Completed.Connect(() => {
            progression["2progressionBar"].bar.Size = new UDim2(0, 0, 1, 0);
            const barTweenInfo = new TweenInfo(timeToFill, Enum.EasingStyle.Linear, Enum.EasingDirection.InOut, -1);
            this.barTween = TweenService.Create(progression["2progressionBar"].bar, barTweenInfo, { Size: new UDim2(1, 0, 1, 0) });
            this.barTween.Play();
        });
    }

    public show(): void {
        this.menu.Visible = true;
        RunService.BindToRenderStep("crafterMenu", 1, () => {
            if (!this.tileEntity) return;
            this.tileEntity = Assembler.decode(HttpService.JSONDecode(getTileRemoteFunction.InvokeServer(this.tileEntity.position)));
            this.updateAmount();
        });
    }

    /**
     *  update the number about the amount of item in the input or the output
     */
    updateAmount() {
        if (!this.tileEntity) return
        const progression = this.menu.craft.progression;

        if (!this.tileEntity.currentCraft) {
            for (const child of progression["1itemIn"].GetChildren()) {
                if (!child.IsA("ImageLabel")) continue;
                (child.FindFirstChild("TextLabel") as TextLabel)!.Text = "0/0";
            }
            progression["3itemOut"].TextLabel.Text = "0/0";
            return;
        }

        for (const [resource, amountNeeded] of this.tileEntity.currentCraft.buildRessources) {
            const resourceImage = progression["1itemIn"].FindFirstChild(resource) as ImageLabel;
            const quantity = this.tileEntity.resource.get(string.lower(resource))!;
            (resourceImage.FindFirstChild("TextLabel") as TextLabel)!.Text = quantity + "/" + tostring(amountNeeded);
        }
        progression["3itemOut"].TextLabel.Text = (tostring(this.tileEntity.craftedComponent) ?? "0") + "/" + tostring(this.tileEntity.currentCraft.amount);
    }

    public isVisible(): boolean {
        return this.menu.Visible;
    }

    public hide(): void {
        this.menu.Visible = false;
        RunService.UnbindFromRenderStep("crafterMenu");
    }

    public getMenu(): Frame {
        return this.menu;
    }
}

export default AssemblerMenu;