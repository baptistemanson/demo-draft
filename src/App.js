import React from "react";

import SpanHashtag from "./Content/SpanHashtag";
import SpanPerson from "./Content/SpanPerson";
import SpanRelation from "./Content/SpanRelation";

import SuggestionsBox from "./Suggestions/SuggestionsBox";
import defaultContent from "./defaultContent";
import suggestionContext from "./Suggestions/suggestionContext";
import { getMatchingEntries } from "./Suggestions/textMatching";
import { replaceMatchedTextByEntity } from "./draftHelpers";

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
    this.refSuggestions = React.createRef();
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
      editorState: EditorState.set(
        EditorState.createWithContent(blocks, decorator),
        { allowUndo: false }
      ),
      textToMatchPosition: { start: 0, end: 0, contentBlock: null }
    };
    this.focus = () => this.refs.editor.focus();
    this.onChange = editorState => this.setState({ editorState });
  }
  /**
   * Is in charge of detecting where the autocomplete process might occur.
   *
   * @param {*} contentBlock
   * @param {*} callback
   * @param {*} contentState
   */
  findSuggestions(contentBlock, callback, contentState) {
    // if we are initializing the system, we don't try to autocomplete.
    if (!this.state) return;
    /**
     * a string that starts by @, # then a char that is not followed by a whitespace and does not contain #.. OR
     * a string that starts by <> and not followed by a whitespace.
     */
    const regexp = /([@#][^@#<\s][^@#<]*|<>[^@#<\s][^@#<]*)/g;
    const text = contentBlock.getText();
    let matchArr;
    while ((matchArr = regexp.exec(text)) !== null) {
      const start = matchArr.index;

      const selectionState = this.state.editorState.getSelection();

      const end = selectionState.getEndOffset() + 1;
      // when there is already an entity at this location, we don't need automcomplete.
      const key = contentBlock.getEntityAt(start);
      if (!key) {
        this.setState({
          textToMatch: matchArr[0].substr(0, end - start),
          textToMatchPosition: {
            start,
            contentBlock,
            end
          }
        });
        // only one autocomplete at a time, we would have to complexify to have more.
        callback(start, end);
        break;
      }
    }
  }

  keyBindingFn = e => {
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
    // whitespace validates hashtag
    if (
      e.keyCode === 32 &&
      this.state.isCurrentlyAutocompleting &&
      this.state.textToMatch.startsWith("#")
    ) {
      return "validate";
    }
    return getDefaultKeyBinding(e);
  };

  handleKeyCommand = command => {
    switch (command) {
      case "move-up": {
        const suggestions = getMatchingEntries(this.state.textToMatch).map(
          e => e.text
        );
        const index = suggestions.indexOf(this.state.selected);
        if (index > 0) this.setState({ selected: suggestions[index - 1] });
        return "handled";
      }
      case "move-down": {
        const suggestions = getMatchingEntries(this.state.textToMatch).map(
          e => e.text
        );
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
  };

  validate(forceCursorPosition = false) {
    const selected = this.state.selected || this.state.textToMatch;
    const editorState = replaceMatchedTextByEntity(
      this.state.editorState,
      this.state.textToMatchPosition.contentBlock,
      this.state.textToMatchPosition.start,
      this.state.textToMatchPosition.end,
      selected,
      forceCursorPosition
    );
    this.setState({
      isCurrentlyAutocompleting: false,
      editorState,
      selected: ""
    });
  }

  onClick = () => {
    this.focus();
    if (this.state.isCurrentlyAutocompleting) {
      this.validate();
    }
  };

  render() {
    return (
      <div style={styles.root}>
        <suggestionContext.Provider
          value={{
            refSuggestions: this.refSuggestions.current,
            selected: this.state.selected,
            suggestions: getMatchingEntries(this.state.textToMatch),
            onSelectSuggestion: selected => {
              this.setState({ selected }, () => this.validate(true));
            },
            isCurrentlyAutocompleting: isCurrentlyAutocompleting => {
              if (
                this.state.isCurrentlyAutocompleting !==
                isCurrentlyAutocompleting
              ) {
                this.setState({
                  isCurrentlyAutocompleting,
                  selected: ""
                });
              }
            }
          }}
        >
          <div style={styles.editor} onClick={this.onClick}>
            <Editor
              editorState={this.state.editorState}
              onChange={this.onChange}
              placeholder="Write some text..."
              ref="editor"
              handleKeyCommand={this.handleKeyCommand}
              keyBindingFn={this.keyBindingFn}
            />
            <div ref={this.refSuggestions} />
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
    width: "90%"
  },
  editor: {
    border: "1px solid #ddd",
    cursor: "text",
    fontSize: 16,
    minHeight: 40,
    width: "100%",
    padding: 10
  }
};

function App() {
  return (
    <div className="App">
      <IdeaflowEditor />
    </div>
  );
}

export default App;
