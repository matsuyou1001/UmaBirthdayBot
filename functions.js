const axios = require("axios");

exports.exec_webhook = async function (url, avatar_url, username, content, embeds) {
    try {
        const payload = {}
        if (typeof avatar_url === "string") {
            payload.avatar_url = avatar_url;
        }
        if (typeof username === "string") {
            payload.username = username;
        }
        if (typeof content === "string") {
            payload.content = content;
        }
        if (typeof embeds != "undefined") {
            payload.embeds = embeds;
        }
    
        await axios.post(
            url,
            payload
        );
    }
    catch (error) {
        console.error(error);
        return false;
    }

    return true;
}

exports.replace_name = function (name) {
    switch (name) {
        case "エイシンフラッシュ": return "**_Eishin Flash_**💖";
        default: return name;
    }
}

exports.colorcode_to_hex = function (colorcode) {
    return parseInt(colorcode.substr(1, 2), 16) * 65536 + parseInt(colorcode.substr(3, 2), 16) * 256 + parseInt(colorcode.substr(5, 2), 16)
}