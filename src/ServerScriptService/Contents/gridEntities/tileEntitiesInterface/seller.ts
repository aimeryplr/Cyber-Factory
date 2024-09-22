import TileGrid from "ServerScriptService/plot/gridTile";
import Entity from "../../Entities/entity";
import { TileEntity, TileEntityInterface } from "../tileEntity";

// Settings
const MAX_INPUTS = 4;
const MAX_OUTPUTS = 0;
const category: string = "seller";

class Seller implements TileEntityInterface {
    owner: number | undefined;
    playerMoney: NumberValue | undefined;

    setOwner(playerId: number) {
        this.owner = playerId;
        const player = game.GetService("Players").GetPlayerByUserId(playerId) as Player;
        if (player && player.FindFirstChild("leaderstats")) {
            const leaderstats = player.FindFirstChild("leaderstats");
            if (leaderstats) {
                const money = leaderstats.FindFirstChild("Money") as NumberValue;
                if (money !== undefined) {
                    this.playerMoney = money;
                }
            }
        }
    }

    tick(): void {
        return;
    }

    addEntity(entities: Array<Entity | undefined>): Array<Entity | undefined> {
        if (entities.isEmpty() || !this.playerMoney) return entities;

        for (let i = 0; i < entities.size(); i++) {
            const entity = entities[i];
            if (entity !== undefined) {
                this.playerMoney.Value += entity.sellPrice;
                entities[i] = undefined;
            }
        }

        return new Array<Entity | undefined>(entities.size(), undefined);
    }

    getMaxInputs(): number {
        return MAX_INPUTS;
    }
    getMaxOutputs(): number {
        return MAX_OUTPUTS;
    }

    getCategory(): string {
        return category;
    }
}

export default Seller;