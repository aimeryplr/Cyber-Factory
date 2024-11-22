import { FormatInt } from "@rbxts/format-number";
import { ReplicatedStorage } from "@rbxts/services";
import { EARNING_MEAN_TIME } from "ReplicatedStorage/constants";
import { formatCompact } from "ReplicatedStorage/Scripts/Utils/numberFormat";

const player = game.GetService("Players").LocalPlayer;
const counter = player.WaitForChild("PlayerGui")!.WaitForChild("ScreenGui")!.WaitForChild("counter")!

const moneyText = counter.WaitForChild("money") as TextLabel;
const moneyPerSecText = counter.WaitForChild("moneyPerSec") as TextLabel;

const money = player.WaitForChild("leaderstats")!.WaitForChild("Money")! as IntValue;
const earnMoneyEvent = (ReplicatedStorage.FindFirstChild("Events")!.FindFirstChild("earnMoney") as RemoteEvent)!;

export default class CounterUpdater {
    // money/s
    private earningsLog: { amount: number; time: number }[] = []; // Array to store money earned and timestamps
    private totalEarnings = 0; // Total money earned in the last 60 seconds

    constructor() {
        assert(money, "Money not found in leaderstats");
        moneyText.Text = formatCompact(money.Value);

        this.init()
    }

    init() {
        this.setupMeanCalculCouroutine();

        money.Changed.Connect((newMoney: number) => {
            if (moneyText) {
                moneyText.Text = formatCompact(newMoney);
            }
        });

        earnMoneyEvent.OnClientEvent.Connect((moneyEarned: number) => {
            this.addEarnings(moneyEarned);
        });
    }

    addEarnings(amount: number): void {
        const timeNow = tick(); // Current time
        this.earningsLog.push({ amount: amount, time: timeNow });
        this.totalEarnings += amount;
    }

    calculateMean(): [number, number] {
        const timeNow = tick();
        let mean = 0;

        while (this.earningsLog.size() > 0 && timeNow - this.earningsLog[0].time > EARNING_MEAN_TIME) {
            const oldEntry = this.earningsLog.shift();
            if (oldEntry) {
                this.totalEarnings -= oldEntry.amount;
            }
        }

        if (this.earningsLog.size() > 0) {
            const timeSpan = timeNow - this.earningsLog[0].time
            mean = this.totalEarnings / timeSpan;
        }

        return [mean, this.earningsLog.size()];
    }

    setupMeanCalculCouroutine(): void {
        const meanCalcul = coroutine.create(() => {
            while (true) {
                wait(1);
                const [mean, count] = this.calculateMean();
                moneyPerSecText.Text = formatCompact(mean) + "/s";
            }
        });

        coroutine.resume(meanCalcul);
    }
}