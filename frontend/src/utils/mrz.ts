import type { ParsedMrz } from '../types';

/**
 * ICAO Doc 9303 check-digit engine (7-3-1 modulo-10).
 * Weights cycle 7, 3, 1. Values: digits 0-9, A-Z = 10-35, '<' = 0.
 */
const WEIGHTS = [7, 3, 1] as const;

export function mrzCharValue(char: string): number {
  if (char >= '0' && char <= '9') return char.charCodeAt(0) - 48;
  if (char >= 'A' && char <= 'Z') return char.charCodeAt(0) - 55;
  if (char === '<') return 0;
  return 0;
}

export function computeCheckDigit(input: string): string {
  let sum = 0;
  for (let i = 0; i < input.length; i += 1) {
    sum += mrzCharValue(input[i]) * WEIGHTS[i % 3];
  }
  return String(sum % 10);
}

/** Human readable 7-3-1 breakdown for a field, e.g. "J=19×7, 8=8×3, ..." */
export function checkDigitTrace(input: string): string {
  const parts: string[] = [];
  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];
    const token = ch === '<' ? '0' : ch;
    parts.push(`${token}×${WEIGHTS[i % 3]}`);
  }
  return parts.join(' + ');
}

function pair(printed: string, source: string) {
  const expected = computeCheckDigit(source);
  return { printed, expected, valid: printed === expected };
}

/**
 * Parse a TD3 (passport booklet) MRZ: two lines of 44 characters.
 * Extracts fields, recalculates every check-digit locally and compares
 * against the characters actually printed on the document.
 */
export function parseMrz(line1: string, line2: string): ParsedMrz {
  const l1 = (line1 ?? '').padEnd(44, ' ');
  const l2 = (line2 ?? '').padEnd(44, ' ');

  const docNumberRaw = l2.slice(0, 9);
  const docPrintedCheck = l2.slice(9, 10);
  const nationality = l2.slice(10, 13);
  const dob = l2.slice(13, 19);
  const dobPrintedCheck = l2.slice(19, 20);
  const sex = l2.slice(20, 21);
  const expiry = l2.slice(21, 27);
  const expiryPrintedCheck = l2.slice(27, 28);
  const personalNumber = l2.slice(28, 42);
  const compositePrintedCheck = l2.slice(43, 44);
  // Composite check-digit source: line-2 fields 1–43 (everything before the
  // composite digit itself, including the personal-number check-digit).
  const compositeSource = l2.slice(0, 43);

  const nameField = l1.slice(5, 44);
  const nameSplit = nameField.split('<<');
  const surname = (nameSplit[0] ?? '').replace(/</g, ' ').trim();
  const givenNames = (nameSplit.slice(1).join('<<') ?? '').replace(/</g, ' ').trim();

  const doc = pair(docPrintedCheck, docNumberRaw);
  const dobCheck = pair(dobPrintedCheck, dob);
  const expiryCheck = pair(expiryPrintedCheck, expiry);
  const composite = pair(compositePrintedCheck, compositeSource);

  const parsed: ParsedMrz = {
    documentType: l1.slice(0, 2),
    issuedCountry: l1.slice(2, 5),
    surname,
    givenNames,
    docNumberRaw,
    docNumber: docNumberRaw.replace(/</g, '').trim(),
    nationality,
    dob,
    sex: sex.trim(),
    expiry,
    personalNumber: personalNumber.replace(/</g, '').trim(),
    checks: { doc, dob: dobCheck, expiry: expiryCheck, composite },
    valid: doc.valid && dobCheck.valid && expiryCheck.valid && composite.valid,
  };
  return parsed;
}

/** YYMMDD → "15 FEB 1990" style display (window: 00–30 → 2000s, else 1900s). */
export function formatMrzDate(value: string): string {
  if (!/^\d{6}$/.test(value)) return value || '——';
  const yy = Number(value.slice(0, 2));
  const mm = value.slice(2, 4);
  const dd = value.slice(4, 6);
  const year = yy <= 30 ? 2000 + yy : 1900 + yy;
  const months = [
    'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
    'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
  ];
  const month = months[Number(mm) - 1] ?? '???';
  return `${dd} ${month} ${year}`;
}
