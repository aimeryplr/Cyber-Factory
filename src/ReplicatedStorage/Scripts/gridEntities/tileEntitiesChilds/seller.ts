import { Entity } from "ReplicatedStorage/Scripts/Entities/entity";
import { EncodedTileEntity, TileEntity } from "../tileEntity";
import { decodeVector2, decodeVector3Array, encodeVector2, encodeVector3 } from "ReplicatedStorage/Scripts/Utils/encoding";

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

    addEntity(entity: Entity): Entity | undefined {
        if (!this.playerMoney) return entity;

        this.playerMoney.Value += entity.price;

        const player = game.GetService("Players").GetPlayerByUserId(this.owner ?? 0);
        if (!player) return entity;
        earnMoneyEvent!.FireClient(player, entity.price);
        this.sellingCallBack(entity.name);

        return;
    }

    static decode(decoded: unknown): Seller {
        const data = decoded as EncodedTileEntity;
        const seller = new Seller("seller", new Vector3(data.position.x, data.position.y, data.position.z), decodeVector2(data.size), new Vector2(1, 0), 0);
        seller.inputTiles = decodeVector3Array(data.inputTiles) as TileEntity[]
        return seller;
    }

    getNewShape(): BasePart | undefined {
        return;
    }
}

export default Seller;