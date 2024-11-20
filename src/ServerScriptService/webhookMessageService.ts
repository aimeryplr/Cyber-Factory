import { HttpService, Players } from "@rbxts/services"

const webhook = "https://discord.com/api/webhooks/1308723890654023721/LIlKp38nByKdxq5KFo06FPD5h4KpPTdAgzjxjtUSTifI1Dwgy6Meyi6Nte0kc2wbk_cS"

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

export function sendPlayerMessage(player: Player, message: string, color = 0x2e8fde) {
    getPlayerThumbnail(player)
    sendToDiscord({
        embeds: [{
            author: {
                name: "🛠『Welcome to the factory』",
                icon_url: "https://cdn.discordapp.com/attachments/1292168948116361237/1306260260326998149/cyber-factory_logo_discord.png?ex=673e96eb&is=673d456b&hm=ae3fa20cc9385fd7a463d2e167b345f3005c40078c128dba33f13d1305db7819&"
            },
            description: message,
            color: color,
            thumbnail: {url: getPlayerThumbnail(player)},
            timestamp: os.date("%Y-%m-%dT%H:%M:%SZ")
        }]
    })
}

export function sendToDiscord(paylod: any) {
    HttpService.PostAsync(webhook, HttpService.JSONEncode(paylod), Enum.HttpContentType.ApplicationJson)
}