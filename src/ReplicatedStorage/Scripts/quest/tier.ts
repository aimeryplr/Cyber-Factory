import { Reward } from "./quest";

export interface Tier {
    rewards: Reward[];
    nextQuests: string[]
}
