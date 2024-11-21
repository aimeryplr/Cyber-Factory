export interface EncodedEfficiency {
    efficiency: number,
    successHistory: boolean[],
    successHistorySize: number
}

export class Efficiency {
    private efficiency = 1;
    private successHistory = new Array<boolean>();

    private successHistorySize: number;

    constructor(successHistorySize: number) {
        this.successHistorySize = successHistorySize;
    }


    public addSuccess(success: boolean) {
        this.successHistory.insert(0, success);
        if (this.successHistorySize < this.successHistory.size()) {
            this.successHistory.pop()
        }
        this.calculateEfficiency()
    }

    public calculateEfficiency() {
        let sum = 0
        for (const success of this.successHistory) {
            sum += success ? 1 : 0;
        }
        this.efficiency = sum / this.successHistory.size()
        return this.efficiency
    }

    public getEfficiency() {
        return this.efficiency;
    }

    public getSuccessHistory() {
        return this.successHistory;
    }

    public getSuccessHistorySize() {
        return this.successHistorySize;
    }

    public encode() {
        return {
            "efficiency": this.efficiency,
            "successHistory": this.successHistory,
            "successHistorySize": this.successHistorySize
        }
    }

    static decode(decoded: unknown): Efficiency {
        const data = decoded as EncodedEfficiency
        const efficiency = new Efficiency(data.successHistorySize)
        efficiency.efficiency = data.efficiency
        efficiency.successHistory = data.successHistory
        return efficiency
    }
}