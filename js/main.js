const fs = require("fs");
const func = require("./functions.js");
const path = require("path");
const {format} = require("util");

const configPath = path.join(__dirname, "..", "config.json")
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const webhook_url = config.webhook_url;
const avatar_url = config.avatar_url;
const username = config.user_name;
const thumbnail = config.thumbnail;
const color = config.color;
const fields_count = typeof config.fields_count === "undefined" ? 2 : Number(config.fields_count);

const dataPath = path.join(__dirname, "..", "data.json")
const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
const now = new Date();
const today = ("0" + (now.getMonth() + 1)).slice(-2) + "/" + ("0" + (now.getDate())).slice(-2);

const todayumas = data.umamusumes.filter(uma => uma.birthday == today);
if (todayumas.length == 0) {
    process.exit(1);
}

const title = format("🎉 今日は、%sの誕生日です！", todayumas.map(uma => func.replace_name(uma.name)).join("、"));

let current = today;
const fields = [];
for (let i = 1; i <= fields_count; i++ ) {
    const isLast = !data.umamusumes.some(uma => current < uma.birthday);

    const nextday = isLast ?
        data.umamusumes.map(uma => uma.birthday).sort().find(() => true) :
        data.umamusumes.map(uma => uma.birthday).sort().find(day => current < day) ;

    const nextumas = data.umamusumes.filter(uma => uma.birthday == nextday)
    const date = new Date(format("%i/%s", isLast ? now.getFullYear() + 1 : now.getFullYear(), nextday));
    const days = Math.ceil((date - now) / 86400000);

    fields.push({
        name: format("・%i/%i (%s)", date.getMonth() + 1, date.getDate(), days == 1 ? "明日" : days + "日後"),
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
    embeds[0].color = func.colorcode_to_hex(color);
}

func.exec_webhook(webhook_url, avatar_url, username, null, embeds)
    .catch(() => process.exit(1));