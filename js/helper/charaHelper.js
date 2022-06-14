import axios from 'axios';
import { JSDOM } from 'jsdom';

class charaHelper {

    static get #mediaApiEndPoint() { return "http://ja.wikipedia.org/w/api.php"; }
    
    static get #charaListUrl() { return "https://game8.jp/umamusume/225382"; }

    static #isFirst = true;

    static async getNames() {
        const html = await axios.get(this.#charaListUrl)
        const dom = new JSDOM(html.data);

        const implemented = this.#getImplementedNameList(dom.window.document);
        const not_implemented = this.#getNotImplementedNameList(dom.window.document);
        return {
            implemented,
            not_implemented
        };
    }

    /**
     * 
     * @param {Document} doc 
     */
    static #getImplementedNameList(doc) {        
        /**
         * @type {string[]}
         */
        const names = [];

        const headerIds = [ "hm_1", "hm_2", "hm_3" ];
        for (const headerId of headerIds) {
            const startPoint = doc.getElementById(headerId);
            let current = startPoint;

            while (current.nextElementSibling != null) {
                const next = current.nextElementSibling;
                if (next.tagName !== "TABLE") continue;

                for (let i = 0; i < next.rows.length; i++) {
                    const row = next.rows[i];

                    var cells = row.getElementsByTagName("td");
                    if (cells.length === 0) continue;

                    names.push(cells[0].getElementsByTagName("a")[0].textContent);
                }

                break;
            }
        }

        return [ ...new Set(names) ];
    }

    /**
     * 
     * @param {Document} doc 
     */
    static #getNotImplementedNameList(doc) {
        /**
         * @type {string[]}
         */
        const names = [];

        const startPoint = doc.getElementById("hm_4");
        let current = startPoint;

        while (current.nextElementSibling != null) {
            const next = current.nextElementSibling;
            if (next.tagName !== "TABLE") continue;

            for (let i = 0; i < next.rows.length; i++) {
                const row = next.rows[i];

                var cells = row.getElementsByTagName("td");
                if (cells.length === 0) continue;

                names.push(cells[0].getElementsByTagName("div")[0].textContent.trim());
            }

            break;
        }

        return names;
    }

    /**
     * 
     * @param {string} title 
     */
    static async #execMediaApiFromPageTitle(title) {
        const parameter = {
            format: "json",
            action: "query",
            prop: "revisions",
            rvprop: "content",
            rvslots: "*",
            titles: title
        };
        const query = Object.keys(parameter).map(key => `${key}=${parameter[key]}`).join("&");
        const url = encodeURI(`${this.#mediaApiEndPoint}?${query}`);

        if (!this.#isFirst) {
            await this.sleep(1000)
        }
        const response = await axios.get(url);
        this.#isFirst = false;

        if (300 <= response.status) {
            throw new Error(`media api has returned error code ${response.status}(${response.statusText})`);
        }

        return response.data;
    }

    /**
     * 
     * @param {string} name horse name
     */
    static async #getThroughbredInfoFromMediaApi(name) {
        const result = await this.#execMediaApiFromPageTitle(name);

        const page = Object.values(result.query.pages).find(() => true);
        if (typeof page.missing !== "undefined") {
            console.log(`missing ${name}.`);
            return null;
        }

        const str = page.revisions.find(() => true).slots.main['*'];
        if (typeof str !== "string") {
            throw new TypeError();
        }

        const is_thoroughbred = new RegExp(/種\s?=\s?\[\[サラブレッド\]\]/, "m");
        
        if (!is_thoroughbred.test(str)) {
            return await this.#getThroughbredInfoFromMediaApi(`${name} (競走馬)`);
        }

        return str;
    }

    /**
     * 
     * @param {string} name horse name
     */
    static async getThoroughbredBirthdayAsync(name) {
        const str = await this.#getThroughbredInfoFromMediaApi(name);

        const birthday_mark = new RegExp(/(?<=\|\s?生\s?=\s?).+/, "m");

        const match = birthday_mark.exec(str);
        if (match == null) {
            throw new Error(`${name}'s birthday is not found.`);
        }

        const patterns = [
            /(\[\[)?(?<year>\d{1,4})年(\]\])?(\[\[)?(?<month>\d{1,2})月(?<day>\d{1,2})日(\]\])?/,
            /\{\{生年月日(と馬齢)?(\|p=0)?\|(?<year>\d{1,4})\|(?<month>\d{1,2})\|(?<day>\d{1,2})(\|\w+)?\}\}/
        ]

        const birthMatch = patterns.map(reg => reg.exec(match[0])).find(array => array != null);
        if (birthMatch == null) {
            throw new Error(`${name}'s birthday is not found.`);
        }

        const year = new Number(birthMatch.groups.year);
        const month = new Number(birthMatch.groups.month);
        const day = new Number(birthMatch.groups.day);

        return new Date(year, month - 1, day, 0, 0, 0, 0);
    }

    /**
     * 
     * @param {number} time sleep length(ms) 
     * @returns 
     */
    static sleep(time) {
        return new Promise((resolve, _) => setTimeout(() => resolve(), time));
    }
}

export default charaHelper;