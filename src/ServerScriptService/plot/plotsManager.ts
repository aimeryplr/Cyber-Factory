import Plot from "./plot";
import { RunService } from "@rbxts/services";

class PlotsManager {
    private plots: Array<Plot>;
    private progress: number;

    constructor() {
        this.plots = new Array<Plot>();
        this.init();
        this.progress = 0;
    }

    private init() {
        this.setupUpdate();
        this.retrievePlots();
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
        return this.plots.some(plot => plot.getOwner() === userID) === undefined;
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
}

export default PlotsManager;