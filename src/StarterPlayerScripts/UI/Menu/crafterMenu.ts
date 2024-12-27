import Crafter from "ReplicatedStorage/Scripts/Tile/TileEntities/Machines/crafter";
import { HttpService, ReplicatedStorage, RunService, TweenService } from "@rbxts/services";
import { decodeTile } from "ReplicatedStorage/Scripts/TileGrid/tileGridUtils";
import { getImage } from "../Utils/imageUtils";
import { entitiesList } from "ReplicatedStorage/Scripts/Entities/EntitiesList";
import { Component, EntityType } from "ReplicatedStorage/Scripts/Entities/entity";
import { getUnlockedEntities } from "ReplicatedStorage/Scripts/Quests/questList";
import { Quest } from "ReplicatedStorage/Scripts/Quests/quest";
import { areSameQuests } from "ReplicatedStorage/Scripts/Quests/questUtils";
import { Menu } from "./menu";
import { setRandomPitch } from "ReplicatedStorage/Scripts/Utils/playSound";

const changeCrafterOrAssemblerCraft = ReplicatedStorage.WaitForChild("Events").WaitForChild("changeCrafterOrAssemblerCraft") as RemoteEvent;
const getTileRemoteFunction = ReplicatedStorage.WaitForChild("Events").WaitForChild("getTile") as RemoteFunction;
const playerQuestEvent = ReplicatedStorage.WaitForChild("Events").WaitForChild("playerQuests") as RemoteEvent;

class CrafterMenu implements Menu {
    player: Player;
    tileEntity: Crafter | undefined;
    quests = new Array<Quest>();
    wasCrafting = false;
    gridBase: BasePart;
    menu: crafterMenu;

    private barTween: Tween | undefined;

    constructor(player: Player, gridBase: BasePart) {
        this.player = player;
        this.gridBase = gridBase;
        this.menu = player.WaitForChild("PlayerGui")!.WaitForChild("ScreenGui")!.WaitForChild("crafterMenu") as crafterMenu;
        playerQuestEvent.OnClientEvent.Connect((quests: Quest[]) => this.setupQuests(quests));
    }

    setupQuests(quests: Quest[]) {
        if (areSameQuests(this.quests, quests)) return;

        this.quests = quests;
        this.loadCraftList();
    }

    setTileEntity(crafter: Crafter): void {
        if (this.tileEntity?.position === crafter.position && this.tileEntity.currentCraft?.name === crafter.currentCraft?.name) return;
        this.tileEntity = crafter;

        this.setupMenu();
    }

    public setupMenu(): void {
        if (!this.tileEntity) return;
        this.loadCraftList();

        if (this.tileEntity.currentCraft) {
            (this.menu.searchCraft.FindFirstChild(this.tileEntity.currentCraft.name) as TextButton)!.BorderSizePixel = 2;
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

        const components = getUnlockedEntities(this.quests).filter(entity => entitiesList.get(entity)?.type === EntityType.COMPONENT);

        for (const componentName of components) {
            const component = entitiesList.get(componentName) as Component;
            const newComponent = componentPrefab.Clone();
            newComponent.Name = componentName;
            (newComponent.FindFirstChild("itemName")! as TextLabel).Text = componentName;
            (newComponent.FindFirstChild("itemImage")! as ImageLabel).Image = getImage(component);
            (newComponent.FindFirstChild("price")!.FindFirstChild("price")! as TextLabel).Text = tostring(component.price);
            newComponent.Parent = this.menu.searchCraft;

            newComponent.MouseButton1Click.Connect(() => {
                if (!this.tileEntity) return;
                if (this.tileEntity.currentCraft && this.tileEntity.currentCraft.name === componentName) return;

                const selectRecipeSound = ReplicatedStorage.WaitForChild("Sounds").WaitForChild("SFX").WaitForChild("selectRecipe") as Sound;
                setRandomPitch(selectRecipeSound, 0.98, 1.02);
                selectRecipeSound.Play();
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
            this.tileEntity = decodeTile(HttpService.JSONDecode(getTileRemoteFunction.InvokeServer(this.tileEntity!.position)), this.gridBase) as Crafter;
            wait(0.1);
        }

        this.setupProgressBar();
    }

    setupCraft(component: Component): void {
        const [compBuildRessource] = component.buildRessources;
        const componentInImg = entitiesList.get(compBuildRessource[0]);

        this.menu.craft.itemName.Text = component.name;
        this.menu.craft.itemName.price.TextLabel.Text = component.price as unknown as string;
        this.menu.craft.progression["3itemOut"].Image = getImage(component);
        this.menu.craft.progression["1itemIn"].Image = getImage(componentInImg);
        this.menu.craft.progression["3itemOut"].speed.Text = component.speed * component.amount + "/min";
        this.menu.craft.progression["1itemIn"].speed.Text = compBuildRessource[1] * component.speed + "/min";
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
        const timeToFill = 60 / this.tileEntity!.currentCraft!.speed;

        progression["2progressionBar"].bar.Size = new UDim2(0, 0, 1, 0);
        const barTweenInfo = new TweenInfo(timeToFill, Enum.EasingStyle.Linear, Enum.EasingDirection.InOut);
        this.barTween = TweenService.Create(progression["2progressionBar"].bar, barTweenInfo, { Size: new UDim2(1, 0, 1, 0) });
        this.barTween.Play();
        this.barTween.Completed.Connect(() => {
            progression["2progressionBar"].bar.Size = new UDim2(0, 0, 1, 0);
        })
    }

    public show(): void {
        this.menu.Visible = true;
        RunService.BindToRenderStep("crafterMenu", 1, () => {
            if (!this.tileEntity) return;
            this.wasCrafting = this.tileEntity.isCrafting;
            this.tileEntity = Crafter.decode(HttpService.JSONDecode(getTileRemoteFunction.InvokeServer(this.tileEntity.position)), this.gridBase);
            this.updateAmount();
            this.setupProgressBar();
        });
    }

    /**
     *  update the number about the amount of item in the input or the output
     */
    updateAmount() {
        if (!this.tileEntity) return

        if (!this.tileEntity.currentCraft) {
            this.menu.craft.progression["1itemIn"].amount.Text = "0/0";
            this.menu.craft.progression["3itemOut"].amount.Text = "0/0";
            return;
        }

        const [amountIn] = this.tileEntity.currentCraft.buildRessources;

        (this.menu.craft.FindFirstChild("efficiency")!.FindFirstChild("efficiency") as TextLabel).Text = tostring(math.floor(this.tileEntity.getEfficiency() * 100)) + "%";
        this.menu.craft.progression["1itemIn"].amount.Text = (tostring(this.tileEntity.resource) ?? "0") + "/" + tostring(amountIn[1]);
        this.menu.craft.progression["3itemOut"].amount.Text = (tostring(this.tileEntity.craftedComponent) ?? "0") + "/" + tostring(this.tileEntity.currentCraft.amount);
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

export default CrafterMenu;