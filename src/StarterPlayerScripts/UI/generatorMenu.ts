import { HttpService, ReplicatedStorage, RunService, TweenService } from "@rbxts/services";
import Generator from "ReplicatedStorage/Scripts/gridEntities/tileEntitiesChilds/generator";
import { decodeTile } from "ReplicatedStorage/Scripts/gridTileUtils";
import { getImage } from "./imageUtils";
import { entitiesList } from "ReplicatedStorage/Scripts/Entities/EntitiesList";
import { Quest } from "ReplicatedStorage/Scripts/quest/quest";
import { getUnlockedEntities } from "ReplicatedStorage/Scripts/quest/questList";
import { EntityType } from "ReplicatedStorage/Scripts/Entities/entity";
import { areSameQuests } from "ReplicatedStorage/Scripts/quest/questUtils";
import { Menu } from "./menu";

const changeGeneratorRessourceEvent = game.GetService("ReplicatedStorage").WaitForChild("Events").WaitForChild("changeGeneratorRessource") as RemoteEvent;
const getTileRemoteFunction = ReplicatedStorage.WaitForChild("Events").WaitForChild("getTile") as RemoteFunction;
const playerQuestEvent = ReplicatedStorage.WaitForChild("Events").WaitForChild("playerQuests") as RemoteEvent;

class GeneratorMenu implements Menu {
    player: Player;
    menu: generatorMenu;
    quests = new Array<Quest>();
    tileEntity: Generator | undefined;
    private timeGeneratorAdded: number | undefined;

    private barTween: Tween | undefined;

    constructor(player: Player) {
        this.player = player;
        this.menu = player.WaitForChild("PlayerGui")!.WaitForChild("ScreenGui")!.WaitForChild("generatorMenu") as generatorMenu;
        playerQuestEvent.OnClientEvent.Connect((quests: Quest[]) => this.setupQuests(quests));
    }

    setTileEntity(generator: Generator) {
        if (this.tileEntity?.position === generator.position && this.tileEntity?.ressource?.name === generator.ressource?.name) return;

        this.timeGeneratorAdded = tick();
        this.tileEntity = generator;
        this.setupMenu();
    }

    setupQuests(quests: Quest[]) {
        if (areSameQuests(this.quests, quests)) return;

        this.quests = quests;
        this.setupResources();
        this.setupButtons();
    }

    setupMenu(): void {
        if (!this.tileEntity) return;

        this.setupResources();
        this.setupCurrentRessource(this.tileEntity);
        this.setupButtons()

        // setup the progression bar if it's outputing
        this.setupProgressBar();
        this.setupClose()
    }

    setupClose() {
        this.menu.toptop.close.MouseButton1Click.Connect(() => {
            this.hide();
        })
    }

    setupCurrentRessource(generator: Generator): void {
        // reset all the stroke
        for (const ressource of this.menu.ressources.GetChildren()) {
            if (!ressource.IsA("Frame")) continue;

            (ressource.FindFirstChild("ImageButton")!.FindFirstChild("UIStroke")! as UIStroke).Transparency = 1;
        }

        const ressource = this.menu.ressources.FindFirstChild(generator.ressource?.name ?? "")
        if (!ressource) return;

        (ressource.FindFirstChild("ImageButton")!.FindFirstChild("UIStroke")! as UIStroke).Transparency = 0;
        this.menu.progression["1speed"].Text = generator.speed + "/min";
    }

    destroyResources() {
        for (const resource of this.menu.ressources.GetChildren()) {
            if (!resource.IsA("Frame")) continue;
            resource.Destroy();
        }
    }

    setupResources() {
        this.destroyResources();
        const resources = getUnlockedEntities(this.quests).filter(entity => entitiesList.get(entity)?.type === EntityType.RESOURCE);
        const prefabResource = ReplicatedStorage.FindFirstChild("prefab")!.FindFirstChild("UI")!.FindFirstChild("resource") as Frame;
        for (const resourceName of resources) {
            const resource = entitiesList.get(resourceName)!;
            const resourceFrame = prefabResource.Clone();
            resourceFrame.Name = resourceName;
            (resourceFrame.FindFirstChild("ImageButton") as ImageButton)!.Image = getImage(resource);
            (resourceFrame.FindFirstChild("TextLabel") as TextLabel)!.Text = resourceName;
            (resourceFrame.FindFirstChild("price")?.FindFirstChild("TextLabel") as TextLabel)!.Text = tostring(resource.price);
            resourceFrame.Parent = this.menu.ressources;
        }
    }

    setupButtons() {
        const resources = this.menu.ressources;
        for (const resource of resources.GetChildren()) {
            if (!resource.IsA("Frame")) continue;

            const imageButton = resource.FindFirstChild("ImageButton") as ImageButton;
            imageButton.Image = getImage(entitiesList.get(resource.Name));
            imageButton.MouseButton1Click.Connect(() => {
                if (!this.tileEntity) return;
                if (this.tileEntity.ressource?.name === resource.Name) return;

                changeGeneratorRessourceEvent.FireServer(this.tileEntity.position, resource.Name);
                while (this.tileEntity?.ressource?.name !== resource.Name) {
                    this.tileEntity = decodeTile(HttpService.JSONDecode(getTileRemoteFunction.InvokeServer(this.tileEntity.position))) as Generator;
                    wait(0.1);
                }
                this.timeGeneratorAdded = tick();
                this.setupCurrentRessource(this.tileEntity);
                this.setupProgressBar();
            });
        }
    }

    private setupProgressBar(): void {
        const progression = this.menu.progression;
        const timeToFill = 60 / this.tileEntity!.speed;
        const calculatedProgression = this.tileEntity!.lastProgress + ((tick() - this.timeGeneratorAdded!) % timeToFill) / timeToFill

        if (!this.tileEntity!.ressource) return this.resetBartween();

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

    updateAmount() {
        (this.menu.progression["3efficiency"].efficiency as TextLabel).Text = tostring(math.floor(this.tileEntity!.getEfficiency() * 100)) + "%";
    }

    resetBartween(): void {
        this.barTween?.Cancel();
        this.menu.progression["2progressionBar"].bar.Size = new UDim2(0, 0, 1, 0);
    }

    public show(): void {
        this.menu.Visible = true;
        RunService.BindToRenderStep("generatorMenu", 1, () => {
            if (!this.tileEntity) return;
            this.tileEntity = Generator.decode(HttpService.JSONDecode(getTileRemoteFunction.InvokeServer(this.tileEntity.position)));
            this.updateAmount();
        })
    }
    
    public isVisible(): boolean {
        return this.menu.Visible;
    }

    public hide(): void {
        this.menu.Visible = false;
        RunService.UnbindFromRenderStep("generatorMenu");
    }

    public getMenu(): Frame {
        return this.menu;
    }
}

export default GeneratorMenu;