import React from "react";

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
  const matchingRegexp = new RegExp(`.*${selected}.*`);
  return hashtag.filter(s => s.match(matchingRegexp));
};
