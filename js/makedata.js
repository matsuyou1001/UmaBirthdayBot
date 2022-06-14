import fs from "fs/promises";
import path from "path";
import url from "url";
import charaHelper from "./helper/charaHelper.js"

async function main() {
    console.log(`loading names...`);
    const { implemented, not_implemented } = await charaHelper.getNames();
    const names = implemented.map(name => { return { name: name, is_implemented: true }; })
                             .concat(
                                 not_implemented.map(name => { return { name: name, is_implemented: false }; })
                             );    

    const umamusumes = [];
    for (const { name, is_implemented } of names) {
        console.log(`processing ${name}...`);
        const birthday = await charaHelper.getThoroughbredBirthdayAsync(name);
        const date = `${("0" + (birthday.getMonth() + 1)).slice(-2)}/${("0" + birthday.getDate()).slice(-2)}`;

        umamusumes.push({
            name: name,
            birthday: date,
            is_implemented: is_implemented
        });
    }

    const data = {
        umamusumes: umamusumes.sort((o1, o2) => Intl.Collator().compare(o1.name, o2.name))
    };

    console.log(`saving to data.json...`);
    const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
    const dataPath = path.join(__dirname, "..", "data.json");
    await fs.writeFile(dataPath, JSON.stringify(data, null, 2), "utf8");

    console.log(`done.`);
}

await main();