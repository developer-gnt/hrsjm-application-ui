import { formatImpactNumber } from './format-impact-number';

describe('formatImpactNumber', () => {
  it.each([
    [100079, '1,00,079'],
    [200000, '2,00,000'],
    [199800, '1,99,800'],
    [125000, '1,25,000'],
    [215500, '2,15,500'],
    [201250, '2,01,250'],
    [1000, '1,000'],
    [10000, '10,000'],
    [0, '0'],
    [1234.5, '1,234.5'],
    [Number.MAX_SAFE_INTEGER, '9,00,71,99,25,47,40,991'],
  ])('formats %s as %s', (value, expected) => {
    expect(formatImpactNumber(value)).toBe(expected);
  });

  it.each([null, undefined, -1, Number.NaN, Number.POSITIVE_INFINITY])(
    'returns a safe fallback for %s',
    value => {
      expect(formatImpactNumber(value)).toBe('—');
    },
  );
});
