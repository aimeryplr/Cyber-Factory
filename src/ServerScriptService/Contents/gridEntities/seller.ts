import Entity from "../Entities/entity";
import TileEntity from "./tileEntity";

// Settings
const MAX_INPUTS = 4;
const MAX_OUTPUTS = 0;
const category: string = "seller";

class Seller extends TileEntity {
    owner: number | undefined;

    constructor(name: String, position: Vector3, size: Vector2, speed: number, direction: Vector2) {
        super(name, position, size, direction, speed, MAX_INPUTS, MAX_OUTPUTS, category);
    }
    
    setOwner(player: number) {
        this.owner = player;
    }
    
    tick(): void {
        return;
    }
    
    addEntity(entities: Array<Entity | undefined>): Array<Entity | undefined> {
        //this code sucks
        const player = this.getPlayer();
        if (player && player.FindFirstChild("leaderstats")) {
            const leaderstats = player.FindFirstChild("leaderstats");
            if (leaderstats) {
                const money = leaderstats.FindFirstChild("Money") as NumberValue;
                if (money !== undefined) {
                    for (let i = 0; i < entities.size(); i++) {
                        const entity = entities[i];
                        if (entity !== undefined) {
                            money.Value += entity.sellPrice;
                            entities[i] = undefined;
                        }
                    }
                }
            }
        }
        
        return new Array<Entity | undefined>(entities.size(), undefined);
    }

    getPlayer(): Player | undefined {
        if (this.owner === undefined) return undefined;
        return game.GetService("Players").GetPlayerByUserId(this.owner) as Player;
    }

    setOutput(nextTileEntity: TileEntity): void {
        return;
    }

    setInput(previousTileEntity: TileEntity): void {
        this.inputTiles.push(previousTileEntity);
    }

    flowEntities(gridEntity: TileEntity): void {
        this.setInput(gridEntity);
        gridEntity.setOutput(this);
    }
}

export default Seller;