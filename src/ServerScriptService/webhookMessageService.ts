import { HttpService, Players } from "@rbxts/services"

const webhook = "https://discord.com/api/webhooks/1304187733258010624/_xxW92w8eHOdWuvky9ERVncMq8wOC-JWEB6f-qsq5NxOkbeN-KQ9lFgRnLnF3236L6M5"

function toQueryString(obj: any): string {
    let toQueryString = []
    for (const [key, value] of pairs(obj)) {
        toQueryString.push(`${tostring(key)}=${HttpService.UrlEncode(tostring(value))}`)
    }
    return toQueryString.join("&") // not working
}

function getPlayerThumbnail(player: Player): string {
    const req = HttpService.GetAsync("https://hql5ej2hcxi5orw7h346t3tgmi0yfoqu.lambda-url.eu-west-3.on.aws/?userId=" + HttpService.UrlEncode(tostring(player.UserId)))
    return (HttpService.JSONDecode(req) as {imageUrl: string}).imageUrl
}

export function sendMessage(message: string) {
    HttpService.PostAsync(webhook, HttpService.JSONEncode({ content: message }))   
}

export function sendPlayerMessage(player: Player, message: string) {
    getPlayerThumbnail(player)
    sendToDiscord({
        embeds: [{
            title: player.Name,
            description: message,
            color: 0x2e8fde,
            thumbnail: {url: getPlayerThumbnail(player)}
        }]
    })
}

export function sendToDiscord(paylod: any) {
    HttpService.PostAsync(webhook, HttpService.JSONEncode(paylod), Enum.HttpContentType.ApplicationJson)
}