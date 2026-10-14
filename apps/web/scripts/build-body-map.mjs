// Buduje lib/body-map/body-map-data.json z plikow w body-map-source:
// front.svg i back.svg to sylwetki, a muscle-assignment.json przypisuje
// kazdej sciezce (po jej kolejnosci w pliku) kod grupy miesniowej albo null,
// gdy sciezka jest tylko konturem ciala.
import { readFileSync, writeFileSync } from "node:fs";

const source = new URL("../body-map-source/", import.meta.url);
const assignment = JSON.parse(readFileSync(new URL("muscle-assignment.json", source), "utf8"));

// pelnoekranowe tlo z eksportu grafiki, nie nalezy do sylwetki
const backgroundPaths = { front: 121, back: 77 };

function readView(view) {
  const svg = readFileSync(new URL(`${view}.svg`, source), "utf8");
  const viewBox = svg.match(/viewBox="([^"]+)"/)[1];
  const paths = [...svg.matchAll(/<path[^>]*\sd="([^"]+)"/g)]
    .map((match, index) => ({ d: match[1], group: assignment[view][index], index }))
    .filter((path) => path.index !== backgroundPaths[view])
    .map(({ d, group }) => ({ d, group }));
  return { viewBox, paths };
}

const data = { front: readView("front"), back: readView("back") };
writeFileSync(new URL("../lib/body-map/body-map-data.json", import.meta.url), JSON.stringify(data));
console.log(`przod: ${data.front.paths.length} sciezek, tyl: ${data.back.paths.length} sciezek`);
