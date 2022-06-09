import fs from "fs/promises";
import path from "path";
import url from "url";
import webhooks from "./webhooks.js";
import colorHelper from "./colorHelper.js";

async function main() {      
    const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

    const configPath = path.join(__dirname, "..", "config.json")
    const { webhook_url, avatar_url, user_name, thumbnail, color, fields_count } = JSON.parse(await fs.readFile(configPath, "utf8"));

    const dataPath = path.join(__dirname, "..", "data.json")
    const { umamusumes } = JSON.parse(await fs.readFile(dataPath, "utf8"));
    const now = new Date();
    const today = ("0" + (now.getMonth() + 1)).slice(-2) + "/" + ("0" + (now.getDate())).slice(-2);

    const todayumas = umamusumes.filter(uma => uma.birthday == today);
    if (todayumas.length == 0) {
        return 1;
    }

    const title = `🎉 今日は、${todayumas.map(uma => replace_name(uma.name)).join("、")}の誕生日です！`

    let current = today, elapsedYears = 0;
    const fields = [];
    for (let i = 1; i <= fields_count; i++ ) {
        const isLast = !umamusumes.some(uma => current < uma.birthday);
        if (isLast) elapsedYears++;

        const nextday = isLast ?
            umamusumes.map(uma => uma.birthday).sort().find(() => true) :
            umamusumes.map(uma => uma.birthday).sort().find(day => current < day) ;

        const nextumas = umamusumes.filter(uma => uma.birthday == nextday)
        const date = new Date(`${now.getFullYear() + elapsedYears}/${nextday}`)
        const days = Math.ceil((date - now) / 86400000);

        fields.push({
            name: `${date.getMonth() + 1}/${date.getDate()} (${days == 1 ? "明日" : days + "日後"})`,
            value: nextumas.map(uma => uma.name).join("、")
        });

        current = nextday;
    }

    const embeds = [
        {
            title: title,
            fields: fields,
        }
    ];

    if (typeof thumbnail === "string") {
        embeds[0].thumbnail = {
            url: thumbnail
        }
    }

    if (typeof color === "string") {
        embeds[0].color = colorHelper.toHex(color);
    }

    const successed = await webhooks.exec(webhook_url, avatar_url, user_name, null, embeds);
    return successed ? 0 : 1;
}

function replace_name(name) {
    switch (name) {
        case "エイシンフラッシュ": return "**_Eishin Flash_**💖";
        default: return name;
    }
}

const exitCode = await main();
process.exit(exitCode);