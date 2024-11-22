import { getPlayerData } from "ServerScriptService/Datastore/datastore";
import { TileGrid } from "../../ReplicatedStorage/Scripts/Tile Grid/tileGrid";
import Plot from "./plot";
import { HttpService, Players, ReplicatedStorage, RunService } from "@rbxts/services";
import { getUnlockedTile } from "ReplicatedStorage/Scripts/Quest/questList";
import { sendPlayerMessage } from "ServerScriptService/webhookMessageService";

const sendTileGrid = ReplicatedStorage.WaitForChild("Events").WaitForChild("sendTileGrid") as RemoteEvent;
const playerQuest = ReplicatedStorage.WaitForChild("Events").WaitForChild("playerQuests") as RemoteEvent;
const unlockedTileListEvent = ReplicatedStorage.WaitForChild("Events").WaitForChild("unlockedTileList") as RemoteEvent;

/**
 * holds every plot in the game with a owner or not
 */
class PlotManager {
    private plots: Array<Plot>;
    private progress: number;

    constructor() {
        this.plots = new Array<Plot>();
        this.init();
        this.progress = 0;
    }

    private init() {
        this.retrievePlots();
        this.setupPlots();
        this.setupUpdate();
    }


    public addPlot(plot: Plot) {
        this.plots.push(plot);
    }

    public getPlots() {
        return this.plots;
    }

    public getPlotByOwner(userID: number) {
        return this.plots.find(plot => plot.getOwner() === userID);
    }

    public createPlot(gridBase: BasePart) {
        const plot = new Plot(gridBase);
        this.addPlot(plot);
        return plot;
    }

    public hasPlayerClaimedPlot(userID: number) {
        return this.plots.some(plot => plot.getOwner() === userID);
    }

    private setupUpdate() {
        RunService.Heartbeat.Connect((dt) => {
            this.incrementProgress(dt);
            this.plots.forEach(plot => plot.update(this.progress));
        });
    }
    incrementProgress(dt: number) {
        this.progress = (this.progress + dt) % 1000;
    }

    private retrievePlots() {
        this.plots = new Array<Plot>();
        const gridBases = game.Workspace.FindFirstChild("plots")?.GetChildren();
        if (gridBases) {
            gridBases.forEach((gridBase) => {
                this.createPlot(gridBase as BasePart);
            });
        }
    }

    private setupPlots() {
        this.getPlots().forEach((plot) => {
            plot.getGridBase().Touched.Connect((part) => {
                wait(0.2);
                const player = Players.GetPlayerFromCharacter(part.Parent);
                if (!player || this.hasPlayerClaimedPlot(player.UserId)) return;
                const playerData = getPlayerData(player.UserId);

                plot.addOwner(player);

                if (playerData) {
                    plot.setQuests(playerData.quests);
                    unlockedTileListEvent.FireClient(player, getUnlockedTile(playerData.quests));

                    // load the grid
                    const encodedGrid = getPlayerData(player.UserId)?.grid;
                    if (encodedGrid) {
                        const grid = TileGrid.decode(encodedGrid, plot.getGridBase());
                        plot.loadGrid(grid);
                    }
                };
                this.sendGridTile(player, plot)

                wait(0.5);
                playerQuest.FireClient(player, plot.getQuests());
                sendPlayerMessage(player, `Player ${player.Name} has claimed a plot`);
            });
        });
    }

    private sendGridTile(player: Player, plot: Plot) {
        sendTileGrid.FireClient(player, HttpService.JSONEncode(plot.encode()));
    }
}

export default PlotManager;