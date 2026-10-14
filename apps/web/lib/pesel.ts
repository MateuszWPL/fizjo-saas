import type { Sex } from "./types";

// miesiac w PESEL ma dodane przesuniecie zaleznie od stulecia urodzenia
const CENTURY_OFFSETS = [
  { offset: 80, century: 1800 },
  { offset: 0, century: 1900 },
  { offset: 20, century: 2000 },
  { offset: 40, century: 2100 },
];

export function decodePesel(pesel: string): { birthDate: string; sex: Sex } | null {
  if (!/^\d{11}$/.test(pesel)) {
    return null;
  }
  const yy = Number(pesel.slice(0, 2));
  const mm = Number(pesel.slice(2, 4));
  const dd = pesel.slice(4, 6);
  if (Number(dd) < 1 || Number(dd) > 31) {
    return null;
  }
  const match = CENTURY_OFFSETS.find(({ offset }) => mm > offset && mm <= offset + 12);
  if (!match) {
    return null;
  }
  const month = String(mm - match.offset).padStart(2, "0");
  // przedostatnia cyfra parzysta oznacza kobiete
  const sex: Sex = Number(pesel[9]) % 2 === 0 ? "FEMALE" : "MALE";
  return { birthDate: `${match.century + yy}-${month}-${dd}`, sex };
}
