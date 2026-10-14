const WEIGHTS = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];

// ostatnia cyfra PESEL to cyfra kontrolna liczona z pierwszych dziesieciu
export function isValidPesel(pesel: string): boolean {
  if (!/^\d{11}$/.test(pesel)) {
    return false;
  }
  const digits = pesel.split('').map(Number);
  const sum = WEIGHTS.reduce(
    (total, weight, index) => total + weight * digits[index],
    0,
  );
  const control = (10 - (sum % 10)) % 10;
  return control === digits[10];
}
