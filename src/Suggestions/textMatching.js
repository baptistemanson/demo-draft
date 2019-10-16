import escapeString from "escape-string-regexp";
// import distance from "js-levenshtein";

// http://listofrandomnames.com/index.cfm?textarea
const names = [
  "@Sharda Kaya",
  "@Sebastian Hiller",
  "@Shannon Upshaw",
  "@Janina Sanner",
  "@Troy Kardos",
  "@Loren Nakamura",
  "@Basil Kube",
  "@Dotty Gan",
  "@Collin Gulotta",
  "@Doloris Dever",
  "@Syble Peloquin",
  "@Latonia Gamache",
  "@Catalina Knighten",
  "@Yolanda Angert",
  "@Rhoda Giesler",
  "@Velma Cosner",
  "@Pearl Forster",
  "@Karen Nesmith",
  "@Michell Hartnett",
  "@Elanor Rierson",
  "@Suzanne Hosey",
  "@Carola Curling",
  "@Valentina Troung",
  "@Josie Sandt",
  "@Bobbye Mitchener",
  "@Elizabet Soliman",
  "@Lyman Vasques",
  "@Jeffie Epp",
  "@Julieta Stalls",
  "@Adrianne Krick",
  "@Kimberly Minelli",
  "@Antonia Burgan",
  "@Page Lamon",
  "@Santa Behn",
  "@Ernestina Aubry",
  "@Ali Sea",
  "@Bo Stanforth",
  "@Golden Gentle",
  "@Hsiu Holz"
];

const matchingTerms = [
  ...names,
  "@Jacob Cole",
  "@Baptiste Manson",
  "@Ben Sans Soucis",
  "@Cheng Lou",
  "#starwars",
  "#startrek",
  "#adastra",
  "<>hello",
  "<>world"
];

export const getMatchingEntries = selected => {
  const matchingRegexp = new RegExp(`(.*)(${escapeString(selected)})(.*)`, "i");
  const substringMatchingTerms = matchingTerms
    .filter(s => s.match(matchingRegexp))
    .map(s => ({ text: s, html: s.replace(matchingRegexp, "$1<b>$2</b>$3") }));
  return substringMatchingTerms;
};
