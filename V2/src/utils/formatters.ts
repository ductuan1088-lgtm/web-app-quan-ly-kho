// Utility for currency, numbers, and dates in Vietnamese format

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN').format(Math.round(amount)) + ' đ';
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('vi-VN').format(num);
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
};

// Convert number to Vietnamese words (e.g. 1.250.000 -> "Một triệu hai trăm năm mươi nghìn đồng chẵn")
const UNITS = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];
const DIGITS = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

function readThreeDigits(triplet: number, showZeroHundred: boolean): string {
  const hundreds = Math.floor(triplet / 100);
  const tens = Math.floor((triplet % 100) / 10);
  const ones = triplet % 10;
  let result = '';

  if (hundreds > 0 || showZeroHundred) {
    result += DIGITS[hundreds] + ' trăm ';
  }

  if (tens > 1) {
    result += DIGITS[tens] + ' mươi ';
    if (ones === 1) result += 'mốt ';
    else if (ones === 5) result += 'lăm ';
    else if (ones > 0) result += DIGITS[ones] + ' ';
  } else if (tens === 1) {
    result += 'mười ';
    if (ones === 5) result += 'lăm ';
    else if (ones > 0) result += DIGITS[ones] + ' ';
  } else if (hundreds > 0 && ones > 0) {
    result += 'lẻ ' + DIGITS[ones] + ' ';
  } else if (ones > 0) {
    result += DIGITS[ones] + ' ';
  }

  return result.trim();
}

export const numberToVietnameseWords = (amount: number): string => {
  if (amount === 0) return 'Không đồng chẵn.';
  if (amount < 0) return 'Âm ' + numberToVietnameseWords(Math.abs(amount));

  let num = Math.round(amount);
  const triplets: number[] = [];
  while (num > 0) {
    triplets.push(num % 1000);
    num = Math.floor(num / 1000);
  }

  let words = '';
  for (let i = triplets.length - 1; i >= 0; i--) {
    const triplet = triplets[i];
    if (triplet > 0) {
      const showZero = i < triplets.length - 1;
      const tripletText = readThreeDigits(triplet, showZero);
      words += tripletText + ' ' + UNITS[i] + ' ';
    }
  }

  words = words.trim();
  // Capitalize first letter
  if (words.length > 0) {
    words = words.charAt(0).toUpperCase() + words.slice(1);
  }

  return `${words} đồng chẵn.`.normalize('NFC').replace(/\s+/g, ' ');
};
