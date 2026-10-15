// Buduje lib/body-map/body-map-data.json z plikow w body-map-source:
// front.svg i back.svg to sylwetki, a muscle-assignment.json przypisuje
// kazdej sciezce (po jej kolejnosci w pliku) kod grupy miesniowej albo null,
// gdy sciezka jest tylko konturem ciala.
import { readFileSync, writeFileSync } from "node:fs";

const source = new URL("../body-map-source/", import.meta.url);
const assignment = JSON.parse(readFileSync(new URL("muscle-assignment.json", source), "utf8"));

// pelnoekranowe tlo z eksportu grafiki, nie nalezy do sylwetki
const backgroundPaths = { front: 121, back: 77 };

// Grafika nie ma osobnych sciezek dla prostownikow grzbietu w odcinku
// ledzwiowym, w tym miejscu widac tylko kontur sylwetki. Dorysowujemy dwie
// polowki tuz nad konturem (os kregoslupa x=298), wiec ich nadmiar przykrywaja
// rysowane pozniej miesnie najszersze, skosne i posladkowe.
const lumbarPaths = [
  { d: "M298 320 L240 380 L215 470 L250 545 L298 545 Z", group: "ledzwie-l" },
  { d: "M298 320 L356 380 L381 470 L346 545 L298 545 Z", group: "ledzwie-p" },
];

// W kilku miejscach grafika pokazuje sam kontur bez zadnego miesnia (kolana,
// golenie, wlosy, mostek, linie miedzy miesniami), wiec klikniecie tam nic nie
// dawalo. Pod miesniami kladziemy proste prostokaty z kodem grupy. BodyMap
// przycina je do konturu i rysuje bez obrysu, wiec wypelniaja tylko te luki.
// Os ciala: przod x=293.5 (prawa strona pacjenta po lewej), tyl x=298.
const underlays = {
  front: [
    { d: "M225 0 H362 V118 H225 Z", group: "glowa" },
    { d: "M176 176 H240 V200 H176 Z", group: "naramienny-p" },
    { d: "M347 176 H411 V200 H347 Z", group: "naramienny-l" },
    { d: "M240 180 H293.5 V335 H240 Z", group: "piersiowy-p" },
    { d: "M293.5 180 H347 V335 H293.5 Z", group: "piersiowy-l" },
    { d: "M225 300 H362 V610 H225 Z", group: "prosty-brzucha" },
    { d: "M180 752 H293.5 V862 H180 Z", group: "kolano-p" },
    { d: "M293.5 752 H407 V862 H293.5 Z", group: "kolano-l" },
    { d: "M180 862 H293.5 V1040 H180 Z", group: "piszczel-p" },
    { d: "M293.5 862 H407 V1040 H293.5 Z", group: "piszczel-l" },
  ],
  back: [
    { d: "M225 0 H370 V100 H225 Z", group: "glowa" },
    { d: "M250 95 H346 V200 H250 Z", group: "kark" },
    { d: "M282 195 H298 V330 H282 Z", group: "czworoboczny-l" },
    { d: "M298 195 H314 V330 H298 Z", group: "czworoboczny-p" },
    { d: "M155 180 H232 V215 H155 Z", group: "naramienny-l" },
    { d: "M364 180 H440 V215 H364 Z", group: "naramienny-p" },
    { d: "M232 250 H260 V292 H232 Z", group: "lopatka-l" },
    { d: "M336 250 H364 V292 H336 Z", group: "lopatka-p" },
    { d: "M108 300 H155 V425 H108 Z", group: "triceps-l" },
    { d: "M440 300 H487 V425 H440 Z", group: "triceps-p" },
    { d: "M200 715 H298 V800 H200 Z", group: "kolano-l" },
    { d: "M298 715 H395 V800 H298 Z", group: "kolano-p" },
    { d: "M180 975 H298 V1068 H180 Z", group: "lydka-l" },
    { d: "M298 975 H415 V1068 H298 Z", group: "lydka-p" },
    { d: "M180 1068 H298 V1133 H180 Z", group: "stopa-l" },
    { d: "M298 1068 H415 V1133 H298 Z", group: "stopa-p" },
  ],
};

function readView(view) {
  const svg = readFileSync(new URL(`${view}.svg`, source), "utf8");
  const viewBox = svg.match(/viewBox="([^"]+)"/)[1];
  const paths = [...svg.matchAll(/<path[^>]*\sd="([^"]+)"/g)]
    .map((match, index) => ({ d: match[1], group: assignment[view][index], index }))
    .filter((path) => path.index !== backgroundPaths[view])
    .map(({ d, group }) => ({ d, group }));
  // pierwsza sciezka to kontur sylwetki, podklady i ledzwie ida zaraz za nia
  const extra = underlays[view].map((path) => ({ ...path, underlay: true }));
  if (view === "back") {
    extra.push(...lumbarPaths);
  }
  paths.splice(1, 0, ...extra);
  return { viewBox, paths };
}

const data = { front: readView("front"), back: readView("back") };
writeFileSync(new URL("../lib/body-map/body-map-data.json", import.meta.url), JSON.stringify(data));
console.log(`przod: ${data.front.paths.length} sciezek, tyl: ${data.back.paths.length} sciezek`);
