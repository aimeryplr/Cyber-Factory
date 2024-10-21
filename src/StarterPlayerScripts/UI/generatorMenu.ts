import { HttpService, ReplicatedStorage, TweenService } from "@rbxts/services";
import Ressource from "ReplicatedStorage/Scripts/Content/Entities/ressource";
import Generator from "ReplicatedStorage/Scripts/gridEntities/tileEntitiesChilds/generator";
import { decodeTile } from "ReplicatedStorage/Scripts/gridTileUtils";

const changeGeneratorRessourceEvent = game.GetService("ReplicatedStorage").WaitForChild("Events").WaitForChild("changeGeneratorRessource") as RemoteEvent;
const getTileRemoteFunction = ReplicatedStorage.WaitForChild("Events").WaitForChild("getTile") as RemoteFunction;

class GeneratorMenu {
    private player: Player;
    private menu: generatorMenu;
    private generator: Generator | undefined;
    private timeGeneratorAdded: number | undefined;

    private barTween: Tween | undefined;

    constructor(player: Player) {
        this.player = player;
        this.menu = player.WaitForChild("PlayerGui")!.WaitForChild("ScreenGui")!.WaitForChild("generatorMenu") as generatorMenu;
    }

    setGenerator(generator: Generator) {
        if (this.generator?.position === generator.position) return;

        this.timeGeneratorAdded = tick();
        this.generator = generator;
        this.setupGeneratorMenu();
    }

    private setupGeneratorMenu(): void {
        if (!this.generator) return;

        this.setupCurrentRessource(this.generator);
    
        // setup the progression bar if it's outputing
        if (this.generator.outputTiles.isEmpty()) return;
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
        if (!ressource) error("Ressource not found in the menu");

        (ressource.FindFirstChild("ImageButton")!.FindFirstChild("UIStroke")! as ImageLabel).Transparency = 0;
        this.menu.progression.speed.Text = generator.speed + "/s";
    }

    setupButtons() {
        const ressources = this.menu.ressources;
        for (const ressource of ressources.GetChildren()) {
            if (!ressource.IsA("Frame")) continue;

            const imageButton = ressource.FindFirstChild("ImageButton") as ImageButton;
            imageButton.MouseButton1Click.Connect(() => {
                if (!this.generator) return;
                if (this.generator.ressource?.name === ressource.Name) return;

                changeGeneratorRessourceEvent.FireServer(this.generator.position, ressource.Name);
                while (this.generator?.ressource?.name !== ressource.Name) {
                    this.generator = decodeTile(HttpService.JSONDecode(getTileRemoteFunction.InvokeServer(this.generator.position))) as Generator;
                    wait(0.1);
                }
                this.timeGeneratorAdded = tick();
                this.setupCurrentRessource(this.generator);
                this.setupProgressBar();
            });
        }

    }

    private setupProgressBar(): void {
        const progression = this.menu.progression;
        const timeToFill = 60 / this.generator!.speed;
        const calculatedProgression = this.generator!.lastProgress - (tick() - this.timeGeneratorAdded!) % timeToFill / 1.5

        const barTweenInfo = new TweenInfo(timeToFill - calculatedProgression * 1.5, Enum.EasingStyle.Linear, Enum.EasingDirection.InOut);
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

    public isShowing(): boolean {
        return this.menu.Visible;
    }

    public hide(): void {
        this.menu.Visible = false;
    }

    public getMenu(): generatorMenu {
        return this.menu;
    }
}

export default GeneratorMenu;