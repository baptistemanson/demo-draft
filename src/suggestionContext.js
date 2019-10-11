import React from "react";

export default React.createContext({
  selected: "",
  suggestions: [],
  setTextToMatch: () => {},
  moveUp: () => {},
  moveDown: () => {},
  validate: () => {},
  isCurrentlyAutocompleting: () => {}
});

const hashtag = [
  "@starwars",
  "@startrek",
  "@big lebowski",
  "@clockwork orange"
];

export const getMatchingEntries = selected => {
  const matchingRegexp = new RegExp(`.*${selected}.*`);
  return hashtag.filter(s => s.match(matchingRegexp));
};
