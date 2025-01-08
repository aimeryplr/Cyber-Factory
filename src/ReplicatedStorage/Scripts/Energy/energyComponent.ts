export interface EnergyComponent {
    readonly energyUsage: number;
    isProcessing(): boolean;
    turnOff(): void;
    turnOn(): void;
}