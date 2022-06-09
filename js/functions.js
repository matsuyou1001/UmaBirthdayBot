import axios from 'axios'

class functions {
    static async exec_webhook(url, avatar_url, username, content, embeds) {
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
            throw error;
        }
    
        return true;
    }

    static replace_name(name) {
        switch (name) {
            case "エイシンフラッシュ": return "**_Eishin Flash_**💖";
            default: return name;
        }
    }

    static colorcode_to_hex(colorcode) {
        return parseInt(colorcode.substr(1, 2), 16) * 65536 + parseInt(colorcode.substr(3, 2), 16) * 256 + parseInt(colorcode.substr(5, 2), 16)
    }
}

export default functions;