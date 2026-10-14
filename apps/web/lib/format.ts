export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("pl-PL");
}

export function ageFrom(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear();
  const beforeBirthday =
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate());
  return beforeBirthday ? age - 1 : age;
}

export const sexLabels = { FEMALE: "kobieta", MALE: "mężczyzna" } as const;
