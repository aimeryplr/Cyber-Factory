import { MarketplaceService, Players } from "@rbxts/services";
import { sendPlayerDonation, sendPlayerMessage } from "./webhookMessageService";

type DeveloperProduct = {
    id: number;
    amount: number;
};

const devProducts: Map<number, number> = new Map([
    [2650760952, 10],
    [2650763955, 25],
    [2650764211, 100],
    [2650764748, 500],
    [2650765247, 1000],
    [2650765473, 2000],
    [2650765944, 5000],
    [2650766303, 10000],
]);

function processReceipt(receiptInfo: ReceiptInfo): Enum.ProductPurchaseDecision {
    const productId = receiptInfo.ProductId;
    const amount = devProducts.get(productId);

    if (amount !== undefined) {
        sendPlayerDonation(Players.GetPlayerByUserId(receiptInfo.PlayerId)!, amount);
        return Enum.ProductPurchaseDecision.PurchaseGranted;
    }

    return Enum.ProductPurchaseDecision.NotProcessedYet;
}

MarketplaceService.ProcessReceipt = processReceipt;