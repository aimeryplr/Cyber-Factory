import { Entity } from "ReplicatedStorage/Scripts/Entities/entity";
import { TileEntity } from "../tileEntity";
import { decodeVector2, decodeVector3Array, encodeVector2, encodeVector3 } from "ReplicatedStorage/Scripts/encoding";

// Settings
const MAX_INPUTS = 4;
const MAX_OUTPUTS = 0;
const category: string = "seller";

const earnMoneyEvent = game.GetService("ReplicatedStorage").FindFirstChild("Events")?.FindFirstChild("earnMoney") as RemoteEvent;

class Seller extends TileEntity {
    owner: number | undefined;
    playerMoney: NumberValue | undefined;
    sellingCallBack: (entitySoldName: string) => void = () => { };

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

    setSellingCallBack(callback: (entitySoldName: string) => void) {
        this.sellingCallBack = (entitySoldName: string) => callback(entitySoldName);
    }

    tick(): void {
        return;
    }

    addEntity(entities: Array<Entity | undefined>): Array<Entity | undefined> {
        if (entities.isEmpty() || !this.playerMoney) return entities;

        for (let i = 0; i < entities.size(); i++) {
            const entity = entities[i];
            if (entity !== undefined) {
                this.playerMoney.Value += entity.price;
                entities[i] = undefined;

                const player = game.GetService("Players").GetPlayerByUserId(this.owner ?? 0);
                if (!player) continue;
                earnMoneyEvent?.FireClient(player, entity.price);
                this.sellingCallBack(entity.name);
            }
        }

        return new Array<Entity | undefined>(entities.size(), undefined);
    }

    encode(): {} {
        return {
            "category": this.category,
            "position": encodeVector3(this.position),
            "size": encodeVector2(this.size),
            "inputTiles": this.inputTiles.map((tile) => encodeVector3(tile.position)),
        }
    }

    static decode(decoded: unknown): Seller {
        const data = decoded as { position: { x: number, y: number, z: number }, size: { x: number, y: number }, inputTiles: Array<{ x: number, y: number, z: number }> };
        const seller = new Seller("seller", new Vector3(data.position.x, data.position.y, data.position.z), decodeVector2(data.size), new Vector2(1, 0), 0);
        seller.inputTiles = decodeVector3Array(data.inputTiles) as TileEntity[]
        return seller;
    }

    getNewShape(): BasePart | undefined {
        return;
    }
}

export default Seller;