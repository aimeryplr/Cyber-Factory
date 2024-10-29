import { CommandContext } from "@rbxts/cmdr";

const addMoney = (context: CommandContext, money: number) => {
    const player = context.Executor;
    const moneyValue = player.FindFirstChild("leaderstats")?.FindFirstChild("Money") as NumberValue;

    if (!moneyValue) return "You don't have a money value.";
    moneyValue.Value = money;
}

export = addMoney;