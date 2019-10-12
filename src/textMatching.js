import escapeString from "escape-string-regexp";

const matchingTerms = [
  "@jacob",
  "@bat",
  "@ben",
  "@chenglou",
  "#starwars",
  "#startrek",
  "#adastra",
  "<>hello",
  "<>world"
];

export const getMatchingEntries = selected => {
  // @todo use smarter distance function and capital letter matching + context (if a term is close in the "graph" of ideas)
  const matchingRegexp = new RegExp(`.*${escapeString(selected)}.*`, "i");
  return matchingTerms.filter(s => s.match(matchingRegexp));
};
