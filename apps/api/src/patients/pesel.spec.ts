import { describe, expect, it } from 'vitest';
import { isValidPesel } from './pesel.js';

describe('isValidPesel', () => {
  it('przyjmuje PESEL z poprawną cyfrą kontrolną', () => {
    expect(isValidPesel('44051401359')).toBe(true);
    expect(isValidPesel('02070803628')).toBe(true);
  });

  it('odrzuca PESEL z błędną cyfrą kontrolną', () => {
    expect(isValidPesel('44051401358')).toBe(false);
  });

  it('odrzuca ciąg, który nie ma dokładnie 11 cyfr', () => {
    expect(isValidPesel('4405140135')).toBe(false);
    expect(isValidPesel('4405140135a')).toBe(false);
  });
});
