
import axios, { AxiosError } from "axios";
import { JSDOM } from "jsdom";
import { VehicleData } from "./types/data.interface";
import fs from "fs";

async function fetchPage(url: string) {
    const HtmlData = await axios
        .get(url)
        .then(res => res.data)
        .catch((err: AxiosError) => {
            console.error(`There was an error with ${ err.config.url }`);
            console.error(err.toJSON());
        })
    let dom  = new JSDOM(HtmlData);
    return dom.window.document;
}

function extractData(document: Document): HTMLTableElement {
    const tables: NodeListOf<HTMLTableElement> = document.querySelectorAll("table");
    return tables.item(0);
}

console.log("Mario");
const fetchedPage = await fetchPage("https://www.kbb.com/car-make-model-list/used/view-all/make/");
console.log(fetchedPage, "Fetched Page");
if (fetchedPage !== undefined) {
    const table = extractData(fetchedPage);
    const vData: VehicleData[] = [] as VehicleData[];
    Array.from(table.rows).forEach(x => {
        let item: VehicleData = {
            years: []
        };
        Array.from(x.cells).forEach(c => {
            let value = x.cells[c.cellIndex].textContent;
            if (value) {
                switch(c.cellIndex) {
                    case 1:
                        item.model = value;
                    break;
                    case 2:
                        item.make = value;
                    break;
                    case 3:
                        let years = value.split(",");
                        years.forEach(y => item.years.push(y));
                    break;
                }           
            }
        });
        vData.push(item);
    });
    let json = JSON.stringify(vData);
    fs.writeFileSync("vehicledata.json", json);
}