import React from "react";
// @todo reset current word when selecting around...

import SpanHashtag from "./SpanHashtag";
import SpanPerson from "./SpanPerson";
import SpanRelation from "./SpanRelation";

import SuggestionsBox from "./SuggestionsBox";
import defaultContent from "./defaultContent";
import suggestionContext, { getMatchingEntries } from "./suggestionContext";
import { replaceMatchedTextByEntity } from "./replaceWithEntity";

import {
  EditorState,
  Editor,
  CompositeDecorator,
  convertFromRaw,
  getDefaultKeyBinding
} from "draft-js";

class IdeaflowEditor extends React.Component {
  constructor() {
    super();
    const blocks = convertFromRaw(defaultContent);
    const decorator = new CompositeDecorator([
      {
        strategy: findByEntityType("person"),
        component: SpanPerson
      },
      {
        strategy: findByEntityType("hashtag"),
        component: SpanHashtag
      },
      {
        strategy: findByEntityType("relation"),
        component: SpanRelation
      },
      {
        strategy: this.findSuggestions.bind(this),
        component: SuggestionsBox
      }
    ]);

    this.state = {
      isCurrentlyAutocompleting: false,
      selected: "",
      textToMatch: "",
      editorState: EditorState.createWithContent(blocks, decorator),
      textToMatchPosition: { start: 0, end: 0, contentBlock: null },
      counterLetter: 0
    };

    this.focus = () => this.refs.editor.focus();
    this.onChange = editorState => this.setState({ editorState });
  }

  findSuggestions(contentBlock, callback, contentState) {
    // if we are init
    if (!this.state) return;
    const text = contentBlock.getText();
    const regexp = /([@#][^@#<]+|<>[^@#<]+)/g;
    let matchArr, start;
    while ((matchArr = regexp.exec(text)) !== null) {
      start = matchArr.index;
      // if there is already an entity at this position, we dont put the suggestion box
      const key = contentBlock.getEntityAt(start);
      // @todo there is a bug here on delete.
      const prefixLength = matchArr[0][0] === "<" ? 3 : 2;
      const end = start + prefixLength + this.state.counterLetter;
      if (!key) {
        this.setState({
          textToMatch: matchArr[0],
          textToMatchPosition: {
            start,
            contentBlock,
            end
          }
        });
        callback(start, end);
        break;
      }
    }
  }

  keyBindingFn(e) {
    if (this.state.isCurrentlyAutocompleting && isDisplayableChar(e.keyCode)) {
      this.setState({ counterLetter: this.state.counterLetter + 1 });
    }
    if (
      this.state.isCurrentlyAutocompleting &&
      (e.keyCode === 8 || e.keyCode === 46)
    ) {
      // we typed a letter
      this.setState({ counterLetter: this.state.counterLetter - 1 });
    }
    if (e.keyCode === 38 && this.state.isCurrentlyAutocompleting) {
      return "move-up";
    }
    if (e.keyCode === 40 && this.state.isCurrentlyAutocompleting) {
      return "move-down";
    }
    if (e.keyCode === 13 && this.state.isCurrentlyAutocompleting) {
      return "validate";
    }
    if (e.keyCode === 9 && this.state.isCurrentlyAutocompleting) {
      return "validate";
    }
    if (
      e.keyCode === 32 &&
      this.state.isCurrentlyAutocompleting &&
      this.state.textToMatch.startsWith("#")
    ) {
      return "validate";
    }
    return getDefaultKeyBinding(e);
  }

  handleKeyCommand(command) {
    switch (command) {
      case "move-up": {
        const suggestions = getMatchingEntries(this.state.textToMatch);
        const index = suggestions.indexOf(this.state.selected);
        if (index > 0) this.setState({ selected: suggestions[index - 1] });
        return "handled";
      }
      case "move-down": {
        const suggestions = getMatchingEntries(this.state.textToMatch);
        const index = suggestions.indexOf(this.state.selected);
        if (index === -1) this.setState({ selected: suggestions[0] });
        if (index < suggestions.length - 1) {
          this.setState({ selected: suggestions[index + 1] });
        }
        return "handled";
      }
      case "validate":
        this.validate();
        return "handled";
      default:
        return "not-handled";
    }
  }
  validate() {
    const selected = this.state.selected || this.state.textToMatch;
    const editorState = replaceMatchedTextByEntity(
      this.state.editorState,
      this.state.textToMatchPosition.contentBlock,
      this.state.textToMatchPosition.start,
      this.state.textToMatchPosition.end,
      selected
    );
    this.setState({
      isCurrentlyAutocompleting: false,
      editorState,
      selected: "",
      counterLetter: 0
    });
  }

  onClick() {
    this.focus();
    if (this.state.isCurrentlyAutocompleting) {
      this.validate();
    }
  }

  render() {
    return (
      <div style={styles.root}>
        <suggestionContext.Provider
          value={{
            selected: this.state.selected,
            suggestions: getMatchingEntries(this.state.textToMatch),
            onSelectSuggestion: selected => {
              this.setState({ selected }, this.validate.bind(this));
            },
            setTextToMatch: textToMatch => this.setState({ textToMatch }),
            isCurrentlyAutocompleting: isCurrentlyAutocompleting => {
              if (
                this.state.isCurrentlyAutocompleting !==
                isCurrentlyAutocompleting
              ) {
                this.setState({
                  isCurrentlyAutocompleting,
                  selected: "",
                  counterLetter: 0
                });
              }
            }
          }}
        >
          <div style={styles.editor} onClick={this.onClick.bind(this)}>
            <Editor
              editorState={this.state.editorState}
              onChange={this.onChange}
              placeholder="Write a tweet..."
              ref="editor"
              handleKeyCommand={this.handleKeyCommand.bind(this)}
              keyBindingFn={this.keyBindingFn.bind(this)}
            />
            <div id="suggestions" />
          </div>
        </suggestionContext.Provider>
      </div>
    );
  }
}

const findByEntityType = type => {
  return function(contentBlock, callback, contentState) {
    contentBlock.findEntityRanges(character => {
      const entityKey = character.getEntity();
      if (entityKey === null) {
        return false;
      }
      return contentState.getEntity(entityKey).getType() === type;
    }, callback);
  };
};

const styles = {
  root: {
    fontFamily: "'Open Sans', sans-serif",
    width: 600
  },
  editor: {
    border: "1px solid #ddd",
    cursor: "text",
    fontSize: 16,
    minHeight: 40,
    padding: 10
  },
  button: {
    marginTop: 10,
    textAlign: "center"
  }
};

const isDisplayableChar = keycode => {
  const valid =
    (keycode > 47 && keycode < 58) || // number keys
    keycode === 32 ||
    keycode === 13 || // spacebar & return key(s) (if you want to allow carriage returns)
    (keycode > 64 && keycode < 91) || // letter keys
    (keycode > 95 && keycode < 112) || // numpad keys
    (keycode > 185 && keycode < 193) || // ;=,-./` (in order)
    (keycode > 218 && keycode < 223); // [\]' (in order)

  return valid;
};
function App() {
  return (
    <div className="App">
      <IdeaflowEditor />
    </div>
  );
}

export default App;
