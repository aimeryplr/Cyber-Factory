import { HttpService, ReplicatedStorage, TweenService } from "@rbxts/services";
import Generator from "ReplicatedStorage/Scripts/gridEntities/tileEntitiesChilds/generator";
import { decodeTile } from "ReplicatedStorage/Scripts/gridTileUtils";
import InteractionMenu from "./InteractionMenu";

const changeGeneratorRessourceEvent = game.GetService("ReplicatedStorage").WaitForChild("Events").WaitForChild("changeGeneratorRessource") as RemoteEvent;
const getTileRemoteFunction = ReplicatedStorage.WaitForChild("Events").WaitForChild("getTile") as RemoteFunction;

class GeneratorMenu implements InteractionMenu {
    player: Player;
    menu: generatorMenu;
    tileEntity: Generator | undefined;
    private timeGeneratorAdded: number | undefined; 

    private barTween: Tween | undefined;

    constructor(player: Player) {
        this.player = player;
        this.menu = player.WaitForChild("PlayerGui")!.WaitForChild("ScreenGui")!.WaitForChild("generatorMenu") as generatorMenu;
    }

    setTileEntity(generator: Generator) {
        if (this.tileEntity?.position === generator.position && this.tileEntity?.ressource?.name === generator.ressource?.name) return;

        this.timeGeneratorAdded = tick();
        this.tileEntity = generator;
        this.setupMenu();
    }

    setupMenu(): void {
        if (!this.tileEntity) return;

        this.setupCurrentRessource(this.tileEntity);

        // setup the progression bar if it's outputing
        if (this.tileEntity.outputTiles.isEmpty()) return;
        this.setupProgressBar();

        this.setupButtons()
    }

    setupCurrentRessource(generator: Generator): void {
        // reset all the stroke
        for (const ressource of this.menu.ressources.GetChildren()) {
            if (!ressource.IsA("Frame")) continue;

            (ressource.FindFirstChild("ImageButton")!.FindFirstChild("UIStroke")! as ImageLabel).Transparency = 1;
        }

        const ressource = this.menu.ressources.FindFirstChild(string.lower(generator.ressource?.name ?? ""))
        if (!ressource) return;

        (ressource.FindFirstChild("ImageButton")!.FindFirstChild("UIStroke")! as ImageLabel).Transparency = 0;
        this.menu.progression.speed.Text = generator.speed + "/s";
    }

    setupButtons() {
        const ressources = this.menu.ressources;
        for (const ressource of ressources.GetChildren()) {
            if (!ressource.IsA("Frame")) continue;

            const imageButton = ressource.FindFirstChild("ImageButton") as ImageButton;
            imageButton.MouseButton1Click.Connect(() => {
                if (!this.tileEntity) return;
                if (this.tileEntity.ressource?.name === ressource.Name) return;

                changeGeneratorRessourceEvent.FireServer(this.tileEntity.position, ressource.Name);
                while (this.tileEntity?.ressource?.name !== ressource.Name) {
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

        const barTweenInfo = new TweenInfo(timeToFill * (1 - calculatedProgression), Enum.EasingStyle.Linear, Enum.EasingDirection.InOut);
        progression.progressionBar.bar.Size = new UDim2(calculatedProgression, 0, 1, 0);
        const tween = TweenService.Create(progression.progressionBar.bar, barTweenInfo, { Size: new UDim2(1, 0, 1, 0) });
        tween.Play();

        tween.Completed.Connect(() => {
            progression.progressionBar.bar.Size = new UDim2(0, 0, 1, 0);
            const barTweenInfo = new TweenInfo(timeToFill, Enum.EasingStyle.Linear, Enum.EasingDirection.InOut, -1);
            this.barTween = TweenService.Create(progression.progressionBar.bar, barTweenInfo, { Size: new UDim2(1, 0, 1, 0) });
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

export default GeneratorMenu;