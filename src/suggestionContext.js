import React from "react";

import escapeString from "escape-string-regexp";

export default React.createContext({
  selected: "",
  suggestions: [],
  setTextToMatch: () => {},
  moveUp: () => {},
  moveDown: () => {},
  onSelectSuggestion: () => {},
  isCurrentlyAutocompleting: () => {}
});

const hashtag = [
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
  const matchingRegexp = new RegExp(`.*${escapeString(selected)}.*`);
  return hashtag.filter(s => s.match(matchingRegexp));
};
