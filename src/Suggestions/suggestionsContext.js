import React from "react";

// we put the context in a separate file, because interpendent files need simulatenous access.

export default React.createContext({
  refSuggestions: null,
  replaceSuggestionsByEntity: () => {},
  registerActiveBindings: () => {}
});
