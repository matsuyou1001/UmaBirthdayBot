import axios from 'axios';
import colorHelper from "./colorHelper.js";

class webhooks {    
    static async exec(
        webhook_url,
        {
            username,
            avatar_url,
            content,
            embeds,
            tts = false
        }
    ) {
        const payload = { tts: tts };
        if (content != null)
            payload["content"] = content;
        if (username != null)
            payload["username"] = username;
        if (avatar_url != null)
            payload["avatar_url"] = avatar_url;
        if (embeds != null) {
            embeds.forEach(embed => {
                if (typeof embed.color === "string") {
                    embed.color = colorHelper.toHex(embed.color);
                }
            });
            payload["embeds"] = embeds;
        }

        await axios.post(webhook_url, payload);
    }
}

export default webhooks;