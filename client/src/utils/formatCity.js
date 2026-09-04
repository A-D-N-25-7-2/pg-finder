export const formatCity = (city = "") =>
  city
    .trim()
    .toLowerCase()
    .replace(/(^|[\s-])\S/g, (letter) => letter.toUpperCase());
