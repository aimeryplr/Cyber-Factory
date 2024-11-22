import { entitiesList } from "ReplicatedStorage/Scripts/Entities/EntitiesList";
import { HttpService, ReplicatedStorage, RunService, TweenService } from "@rbxts/services";
import { decodeTile } from "ReplicatedStorage/Scripts/Tile Grid/tileGridUtils";
import Assembler from "ReplicatedStorage/Scripts/Tile Entities/tileEntitiesChilds/assembler";
import { Component, EntityType } from "ReplicatedStorage/Scripts/Entities/entity";
import { getImage } from "../Utils/imageUtils";
import { Quest } from "ReplicatedStorage/Scripts/Quest/quest";
import { areSameQuests } from "ReplicatedStorage/Scripts/Quest/questUtils";
import { getUnlockedEntities } from "ReplicatedStorage/Scripts/Quest/questList";
import { Menu } from "./menu";
import { FormatCompact } from "@rbxts/format-number";
import { formatCompact } from "ReplicatedStorage/Scripts/Utils/numberFormat";

const changeCrafterOrAssemblerCraft = ReplicatedStorage.WaitForChild("Events").WaitForChild("changeCrafterOrAssemblerCraft") as RemoteEvent;
const getTileRemoteFunction = ReplicatedStorage.WaitForChild("Events").WaitForChild("getTile") as RemoteFunction;
const playerQuestEvent = ReplicatedStorage.WaitForChild("Events").WaitForChild("playerQuests") as RemoteEvent;

class AssemblerMenu implements Menu {
    player: Player;
    tileEntity: Assembler | undefined;
    quests = new Array<Quest>();
    menu: assemblerMenu;
    wasCrafting = false;

    private barTween: Tween | undefined;

    constructor(player: Player) {
        this.player = player;
        this.menu = player.WaitForChild("PlayerGui")!.WaitForChild("ScreenGui")!.WaitForChild("assemblerMenu") as assemblerMenu;
        playerQuestEvent.OnClientEvent.Connect((quests: Quest[]) => this.setupQuests(quests));
    }

    setupQuests(quests: Quest[]) {
        if (areSameQuests(this.quests, quests)) return;

        this.quests = quests;
        this.loadCraftList();
    }

    setTileEntity(assembler: Assembler): void {
        if (this.tileEntity?.position === assembler.position && this.tileEntity.currentCraft?.name === assembler.currentCraft?.name) return;
        this.tileEntity = assembler;

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

        const components = getUnlockedEntities(this.quests).filter(entity => entitiesList.get(entity)?.type === EntityType.MODULE);

        for (const componentName of components) {
            const component = entitiesList.get(componentName) as Component;
            const newComponent = componentPrefab.Clone();
            newComponent.Name = componentName;
            (newComponent.FindFirstChild("itemName")! as TextLabel).Text = componentName;
            (newComponent.FindFirstChild("itemImage")! as ImageLabel).Image = getImage(component);
            (newComponent.FindFirstChild("price")!.FindFirstChild("price")! as TextLabel).Text = formatCompact(component.price);
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

        this.setupProgressBar();
    }

    setupCraft(component: Component): void {
        const resourceFrame = this.menu.craft.progression["1itemIn"]

        this.menu.craft.itemName.Text = component.name;
        this.menu.craft.itemName.price.TextLabel.Text = FormatCompact(component.price);
        this.menu.craft.progression["3itemOut"].Image = getImage(component);
        this.menu.craft.progression["3itemOut"].speed.Text = component.speed * component.amount + "/min";

        let i = 0;
        for (const [resource, quantity] of component.buildRessources) {
            const componentInImg = entitiesList.get(resource);
            const resourceImage = resourceFrame.GetChildren()[i] as ImageLabel;
            resourceImage.Image = getImage(componentInImg);
            (resourceImage.FindFirstChild("speed") as TextLabel)!.Text = quantity * component.speed + "/min"
            resourceImage.Name = resource;
            i++;
        }
    }

    removeBorder() {
        for (const child of this.menu.searchCraft.GetChildren()) {
            if (!child.IsA("TextButton")) continue;
            child.BorderSizePixel = 0;
        }
    }

    private setupProgressBar(): void {
        if (this.wasCrafting === true || this.tileEntity?.isCrafting === false) return;

        const progression = this.menu.craft.progression;
        const timeToFill = 60 / this.tileEntity!.speed;

        progression["2progressionBar"].bar.Size = new UDim2(0, 0, 1, 0);
        const barTweenInfo = new TweenInfo(timeToFill, Enum.EasingStyle.Linear, Enum.EasingDirection.InOut);
        this.barTween = TweenService.Create(progression["2progressionBar"].bar, barTweenInfo, { Size: new UDim2(1, 0, 1, 0) });
        this.barTween.Play();
        this.barTween.Completed.Connect(() => {
            progression["2progressionBar"].bar.Size = new UDim2(0, 0, 1, 0);
        });
    }

    public show(): void {
        this.menu.Visible = true;
        RunService.BindToRenderStep("crafterMenu", 1, () => {
            if (!this.tileEntity) return;
            this.wasCrafting = this.tileEntity.isCrafting;
            this.tileEntity = Assembler.decode(HttpService.JSONDecode(getTileRemoteFunction.InvokeServer(this.tileEntity.position)));
            this.updateAmount();
            this.setupProgressBar();
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
            (this.menu.craft.FindFirstChild("efficiency")!.FindFirstChild("efficiency") as TextLabel)!.Text = tostring(math.floor(this.tileEntity.getEfficiency() * 100)) + "%"
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