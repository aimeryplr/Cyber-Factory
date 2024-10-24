import InteractionMenu from "./InteractionMenu";
import Crafter from "ReplicatedStorage/Scripts/gridEntities/tileEntitiesChilds/crafter";
import { componentsList } from "ReplicatedStorage/Scripts/Content/Entities/EntitiesList";
import { HttpService, ReplicatedStorage, TweenService } from "@rbxts/services";
import {Component} from "ReplicatedStorage/Scripts/Content/Entities/component";
import Ressource from "ReplicatedStorage/Scripts/Content/Entities/ressource";
import { getImageFromRessourceType } from "ReplicatedStorage/Scripts/Content/Entities/ressourceEnum";
import { decodeTile } from "ReplicatedStorage/Scripts/gridTileUtils";
import { getComponent } from "ReplicatedStorage/Scripts/Content/Entities/entityUtils";

const changeCrafterComponent = ReplicatedStorage.WaitForChild("Events").WaitForChild("changeCrafterComponent") as RemoteEvent;
const getTileRemoteFunction = ReplicatedStorage.WaitForChild("Events").WaitForChild("getTile") as RemoteFunction;

class CrafterMenu implements InteractionMenu {
    player: Player;
    menu: crafterMenu;
    tileEntity: Crafter | undefined;
    private timeCrafterAdded: number | undefined;

    private barTween: Tween | undefined;

    constructor(player: Player) {
        this.player = player;
        this.menu = player.WaitForChild("PlayerGui")!.WaitForChild("ScreenGui")!.WaitForChild("crafterMenu") as crafterMenu;
    }

    setTileEntity(crafter: Crafter): void {
        if (this.tileEntity?.position === crafter.position && this.tileEntity.currentCraft?.name === crafter.currentCraft?.name) return;
        this.tileEntity = crafter;

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

        if (!this.tileEntity.currentCraft) { this.menu.craft.Visible = false; return; }
    }

    loadCraftList() {
        const componentPrefab = ReplicatedStorage.FindFirstChild("prefab")?.FindFirstChild("UI")?.FindFirstChild("component") as TextButton;
        for (const child of this.menu.searchCraft.GetChildren()) {
            if (child.IsA("TextButton")) child.Destroy();
        }

        const components = componentsList
        for (const [componentName, component] of components) {
            const newComponent = componentPrefab.Clone();
            newComponent.Name = componentName;
            (newComponent.FindFirstChild("itemName")! as TextLabel).Text = componentName;
            (newComponent.FindFirstChild("itemImage")! as ImageLabel).Image = component.img;
            (newComponent.FindFirstChild("price")!.FindFirstChild("price")! as TextLabel).Text = (
                getComponent(componentName).sellPrice) as unknown as string;
            newComponent.Parent = this.menu.searchCraft;

            newComponent.MouseButton1Click.Connect(() => {
                if (!this.tileEntity) return;
                if (this.tileEntity.currentCraft && this.tileEntity.currentCraft.name === componentName) return;

                this.setupCurrentComponent(getComponent(componentName) as Component);
            });
        }
    }

    setupCurrentComponent(component: Component): void {
        this.menu.craft.Visible = true;
        this.removeBorder();
        (this.menu.searchCraft.FindFirstChild(component.name) as TextButton)!.BorderSizePixel = 4;
        
        this.setupCraft(component);

        changeCrafterComponent.FireServer(this.tileEntity!.position, component.name);
        while (this.tileEntity?.currentCraft?.name !== component.name) {
            this.tileEntity = decodeTile(HttpService.JSONDecode(getTileRemoteFunction.InvokeServer(this.tileEntity!.position))) as Crafter;
            wait(0.1);
        }
        this.timeCrafterAdded = tick();

        this.setupProgressBar();
    }

    setupCraft(component: Component): void {
        const componentInformation = componentsList.get(component.name);
        const [compBuildRessource] = component.buildRessources;
        const componentInImg = componentsList.get(compBuildRessource[0].name)?.img ?? getImageFromRessourceType((compBuildRessource[0] as Ressource).ressourceType);

        this.menu.craft.itemName.Text = component.name;
        this.menu.craft.itemName.price.TextLabel.Text = component.sellPrice as unknown as string;
        this.menu.craft.progression["3itemOut"].Image = componentInformation!.img;
        this.menu.craft.progression["1itemIn"].Image = componentInImg!;
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
    }

    public isVisible(): boolean {
        return this.menu.Visible;
    }

    public hide(): void {
        this.menu.Visible = false;
    }

    public getMenu(): Frame {
        return this.menu;
    }
}

export default CrafterMenu;