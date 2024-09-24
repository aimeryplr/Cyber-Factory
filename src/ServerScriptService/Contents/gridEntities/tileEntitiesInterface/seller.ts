import Entity from "../../Entities/entity";
import { TileEntity } from "../tileEntity";

// Settings
const MAX_INPUTS = 4;
const MAX_OUTPUTS = 0;
const category: string = "seller";

class Seller extends TileEntity {
    owner: number | undefined;
    playerMoney: NumberValue | undefined;

    constructor(name: string, position: Vector3, size: Vector2, direction: Vector2, speed: number) {
        super(name, position, size, direction, speed, category, MAX_INPUTS, MAX_OUTPUTS);
    }

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

    updateShape(gridBase: BasePart): void {
        return;
    }
}

export default Seller;