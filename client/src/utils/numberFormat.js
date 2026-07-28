/**
 * Convert number to Indian English words (e.g. 5000000 -> 50 Lakhs / 50 Lac, or 50,00,000 Rupees)
 */
export const numberToWordsINR = (num) => {
  const n = Number(num);
  if (isNaN(n) || n <= 0) return '';

  if (n >= 10000000) {
    const cr = n / 10000000;
    return `${Number.isInteger(cr) ? cr : cr.toFixed(2)} Crore`;
  }
  if (n >= 100000) {
    const lakh = n / 100000;
    return `${Number.isInteger(lakh) ? lakh : lakh.toFixed(2)} Lakh`;
  }
  if (n >= 1000) {
    const thousand = n / 1000;
    return `${Number.isInteger(thousand) ? thousand : thousand.toFixed(2)} Thousand`;
  }
  return `${n} Rupees`;
};

/**
 * Format string or number into Indian comma format (e.g. 5000000 -> 50,00,000)
 */
export const formatIndianNumber = (val) => {
  if (val === '' || val === null || val === undefined) return '';
  const numStr = String(val).replace(/,/g, '');
  if (isNaN(numStr)) return val;
  const num = Number(numStr);
  return num.toLocaleString('en-IN');
};
