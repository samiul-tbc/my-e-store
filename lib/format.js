// Price formatting with Bengali digits in BN mode.
const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
export function bnDigits(s) {
  return String(s).replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)]);
}
export function fmtBdt(amount, lang) {
  const v = '৳' + Number(amount || 0).toLocaleString('en-US');
  return lang === 'bn' ? bnDigits(v) : v;
}
