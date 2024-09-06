import Plot from "./plot";

function findPlotWithOwner(owner: Player, plots: Plot[]): Plot | undefined {
  return plots.find((plot) => plot.getOwner() === owner);
}