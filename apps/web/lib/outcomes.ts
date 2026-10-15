import type { OutcomeType } from "./types";

interface Question {
  title: string;
  // odpowiedzi w kolejnosci punktow od 0 do 5
  options: string[];
}

interface Questionnaire {
  name: string;
  fullName: string;
  region: string;
  questions: Question[];
}

// Obszary pytan, punktacja 0-5 i progi interpretacji sa takie jak w oryginalnych
// kwestionariuszach. Opisy odpowiedzi sa wlasnym, uproszczonym sformulowaniem
// na potrzeby prototypu, bo zwalidowane polskie wersje sa chronione prawem
// autorskim. W gabinecie nalezy uzyc zwalidowanego tlumaczenia.
export const questionnaires: Record<OutcomeType, Questionnaire> = {
  ODI: {
    name: "ODI",
    fullName: "Oswestry Disability Index",
    region: "ból dolnego odcinka kręgosłupa",
    questions: [
      {
        title: "Natężenie bólu",
        options: [
          "Obecnie nie odczuwam bólu",
          "Ból jest bardzo łagodny",
          "Ból jest umiarkowany",
          "Ból jest dość silny",
          "Ból jest bardzo silny",
          "Ból jest najsilniejszy, jaki można sobie wyobrazić",
        ],
      },
      {
        title: "Samoobsługa (mycie, ubieranie się)",
        options: [
          "Radzę sobie normalnie, bez dodatkowego bólu",
          "Radzę sobie normalnie, ale z bólem",
          "Radzę sobie powoli i ostrożnie z powodu bólu",
          "Potrzebuję drobnej pomocy, ale większość robię sam",
          "Potrzebuję pomocy przy większości czynności",
          "Nie ubieram się, myję się z trudem i zostaję w łóżku",
        ],
      },
      {
        title: "Podnoszenie przedmiotów",
        options: [
          "Podnoszę ciężkie przedmioty bez dodatkowego bólu",
          "Podnoszę ciężkie przedmioty, ale z bólem",
          "Ból nie pozwala podnosić ciężkich rzeczy z podłogi, ale z wysokości stołu tak",
          "Podnoszę tylko lekkie lub średnie przedmioty z wygodnej wysokości",
          "Podnoszę tylko bardzo lekkie przedmioty",
          "Nie mogę niczego podnosić ani nosić",
        ],
      },
      {
        title: "Chodzenie",
        options: [
          "Ból nie ogranicza dystansu, jaki przechodzę",
          "Ból nie pozwala przejść więcej niż około 1,5 km",
          "Ból nie pozwala przejść więcej niż około 500 m",
          "Ból nie pozwala przejść więcej niż około 100 m",
          "Chodzę tylko o lasce lub kulach",
          "Większość czasu spędzam w łóżku",
        ],
      },
      {
        title: "Siedzenie",
        options: [
          "Siedzę na dowolnym krześle tak długo, jak chcę",
          "Siedzę tak długo, jak chcę, tylko na ulubionym krześle",
          "Ból nie pozwala siedzieć dłużej niż godzinę",
          "Ból nie pozwala siedzieć dłużej niż pół godziny",
          "Ból nie pozwala siedzieć dłużej niż kilka minut",
          "Ból całkowicie uniemożliwia siedzenie",
        ],
      },
      {
        title: "Stanie",
        options: [
          "Stoję tak długo, jak chcę, bez dodatkowego bólu",
          "Stoję tak długo, jak chcę, ale z bólem",
          "Ból nie pozwala stać dłużej niż godzinę",
          "Ból nie pozwala stać dłużej niż pół godziny",
          "Ból nie pozwala stać dłużej niż kilka minut",
          "Ból całkowicie uniemożliwia stanie",
        ],
      },
      {
        title: "Sen",
        options: [
          "Ból nie przeszkadza mi w spaniu",
          "Ból czasami zakłóca sen",
          "Z powodu bólu śpię krócej niż 6 godzin",
          "Z powodu bólu śpię krócej niż 4 godziny",
          "Z powodu bólu śpię krócej niż 2 godziny",
          "Ból całkowicie uniemożliwia sen",
        ],
      },
      {
        title: "Życie seksualne",
        options: [
          "Bez zmian i bez dodatkowego bólu",
          "Bez zmian, ale z dodatkowym bólem",
          "Prawie bez zmian, ale z dużym bólem",
          "Wyraźnie ograniczone przez ból",
          "Prawie niemożliwe z powodu bólu",
          "Całkowicie uniemożliwione przez ból",
        ],
      },
      {
        title: "Życie towarzyskie",
        options: [
          "Bez zmian i bez dodatkowego bólu",
          "Bez zmian, ale ból się nasila",
          "Ból ogranicza tylko bardziej wymagające aktywności, np. sport",
          "Ból ogranicza życie towarzyskie, rzadziej wychodzę",
          "Ból ogranicza życie towarzyskie do domu",
          "Z powodu bólu nie mam życia towarzyskiego",
        ],
      },
      {
        title: "Podróżowanie",
        options: [
          "Podróżuję wszędzie bez bólu",
          "Podróżuję wszędzie, ale z bólem",
          "Ból jest silny, ale wytrzymuję podróże do 2 godzin",
          "Ból ogranicza podróże do mniej niż godziny",
          "Ból ogranicza podróże do niezbędnych, krótszych niż pół godziny",
          "Ból uniemożliwia podróże poza wizytami u lekarza",
        ],
      },
    ],
  },
  NDI: {
    name: "NDI",
    fullName: "Neck Disability Index",
    region: "ból szyi i karku",
    questions: [
      {
        title: "Natężenie bólu",
        options: [
          "Obecnie nie odczuwam bólu",
          "Ból jest bardzo łagodny",
          "Ból jest umiarkowany",
          "Ból jest dość silny",
          "Ból jest bardzo silny",
          "Ból jest najsilniejszy, jaki można sobie wyobrazić",
        ],
      },
      {
        title: "Samoobsługa (mycie, ubieranie się)",
        options: [
          "Radzę sobie normalnie, bez dodatkowego bólu",
          "Radzę sobie normalnie, ale z bólem",
          "Radzę sobie powoli i ostrożnie z powodu bólu",
          "Potrzebuję drobnej pomocy, ale większość robię sam",
          "Potrzebuję pomocy przy większości czynności",
          "Nie ubieram się, myję się z trudem i zostaję w łóżku",
        ],
      },
      {
        title: "Podnoszenie przedmiotów",
        options: [
          "Podnoszę ciężkie przedmioty bez dodatkowego bólu",
          "Podnoszę ciężkie przedmioty, ale z bólem",
          "Ból nie pozwala podnosić ciężkich rzeczy z podłogi, ale z wysokości stołu tak",
          "Podnoszę tylko lekkie lub średnie przedmioty z wygodnej wysokości",
          "Podnoszę tylko bardzo lekkie przedmioty",
          "Nie mogę niczego podnosić ani nosić",
        ],
      },
      {
        title: "Czytanie",
        options: [
          "Czytam tyle, ile chcę, bez bólu szyi",
          "Czytam tyle, ile chcę, z lekkim bólem szyi",
          "Czytam tyle, ile chcę, z umiarkowanym bólem szyi",
          "Umiarkowany ból szyi ogranicza czas czytania",
          "Silny ból szyi wyraźnie ogranicza czytanie",
          "Ból szyi uniemożliwia czytanie",
        ],
      },
      {
        title: "Bóle głowy",
        options: [
          "Nie mam bólów głowy",
          "Rzadko mam lekkie bóle głowy",
          "Rzadko mam umiarkowane bóle głowy",
          "Często mam umiarkowane bóle głowy",
          "Często mam silne bóle głowy",
          "Bóle głowy mam prawie cały czas",
        ],
      },
      {
        title: "Koncentracja",
        options: [
          "Skupiam się bez trudności",
          "Skupiam się z niewielką trudnością",
          "Skupienie się sprawia mi pewną trudność",
          "Skupienie się sprawia mi dużą trudność",
          "Skupienie się sprawia mi bardzo dużą trudność",
          "Nie jestem w stanie się skupić",
        ],
      },
      {
        title: "Praca",
        options: [
          "Wykonuję tyle pracy, ile chcę",
          "Wykonuję zwykłą pracę, ale nic ponad nią",
          "Wykonuję większość zwykłej pracy, ale nic ponad nią",
          "Nie mogę wykonywać zwykłej pracy",
          "Prawie nie mogę pracować",
          "Nie mogę w ogóle pracować",
        ],
      },
      {
        title: "Prowadzenie samochodu",
        options: [
          "Prowadzę bez bólu szyi",
          "Prowadzę tak długo, jak chcę, z lekkim bólem szyi",
          "Prowadzę tak długo, jak chcę, z umiarkowanym bólem szyi",
          "Umiarkowany ból szyi ogranicza czas prowadzenia",
          "Silny ból szyi wyraźnie ogranicza prowadzenie",
          "Ból szyi uniemożliwia prowadzenie",
        ],
      },
      {
        title: "Sen",
        options: [
          "Ból nie przeszkadza mi w spaniu",
          "Ból czasami zakłóca sen",
          "Z powodu bólu śpię krócej niż 6 godzin",
          "Z powodu bólu śpię krócej niż 4 godziny",
          "Z powodu bólu śpię krócej niż 2 godziny",
          "Ból całkowicie uniemożliwia sen",
        ],
      },
      {
        title: "Aktywność w czasie wolnym",
        options: [
          "Robię wszystko, co chcę, bez bólu szyi",
          "Robię wszystko, co chcę, z pewnym bólem szyi",
          "Z powodu bólu robię większość, ale nie wszystko",
          "Z powodu bólu robię tylko niektóre rzeczy",
          "Z powodu bólu prawie nic nie robię",
          "Z powodu bólu nie mogę robić niczego",
        ],
      },
    ],
  },
};

// wynik liczy API (apps/api/src/outcomes/outcome-score.ts), tu tylko podglad w formularzu
export function previewScore(type: OutcomeType, answers: number[]): number {
  const sum = answers.reduce((total, answer) => total + answer, 0);
  return type === "ODI" ? Math.round((sum / 50) * 100) : sum;
}

export function formatScore(type: OutcomeType, score: number): string {
  return type === "ODI" ? `${score}%` : `${score}/50`;
}

const bands: Record<OutcomeType, { max: number; label: string }[]> = {
  ODI: [
    { max: 20, label: "minimalna niepełnosprawność" },
    { max: 40, label: "umiarkowana niepełnosprawność" },
    { max: 60, label: "ciężka niepełnosprawność" },
    { max: 80, label: "bardzo ciężka niepełnosprawność" },
    { max: 100, label: "skrajna niepełnosprawność" },
  ],
  NDI: [
    { max: 4, label: "brak niepełnosprawności" },
    { max: 14, label: "łagodna niepełnosprawność" },
    { max: 24, label: "umiarkowana niepełnosprawność" },
    { max: 34, label: "ciężka niepełnosprawność" },
    { max: 50, label: "całkowita niepełnosprawność" },
  ],
};

export function interpretScore(type: OutcomeType, score: number): string {
  return (bands[type].find((band) => score <= band.max) ?? bands[type][bands[type].length - 1])
    .label;
}
