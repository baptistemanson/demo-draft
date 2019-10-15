import React from "react";

// we put the context in a separate file, because interpendent files need simulatenous access.

export default React.createContext({
  selected: "",
  suggestions: [],
  refSuggestions: null,
  moveUp: () => {},
  moveDown: () => {},
  onSelectSuggestion: () => {},
  isCurrentlyAutocompleting: () => {}
});
