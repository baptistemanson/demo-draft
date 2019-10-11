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
  convertToRaw,
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
      autocompleteEntityType: null,
      selected: "",
      textToMatch: "",
      editorState: EditorState.createWithContent(blocks, decorator),
      textToMatchPosition: { start: 0, end: 0, contentBlock: null }
    };

    this.focus = () => this.refs.editor.focus();
    this.onChange = editorState => this.setState({ editorState });
  }

  logState() {
    console.log(convertToRaw(this.state.editorState.getCurrentContent()));
  }

  findSuggestions(contentBlock, callback, contentState) {
    // if we are init
    if (!this.state) return;
    const text = contentBlock.getText();
    const regexp = /([@#][^@#<]+|<>[^@#<]+)/g;
    let matchArr, start;
    while ((matchArr = regexp.exec(text)) !== null) {
      console.log(matchArr);
      start = matchArr.index;
      // if there is already an entity at this position, we dont put the suggestion box
      const key = contentBlock.getEntityAt(start);
      const end = this.state.editorState.getSelection().getEndOffset() + 1;
      if (!key) {
        this.setState({
          textToMatch: matchArr[0],
          textToMatchPosition: {
            start,
            end,
            contentBlock
          }
        });
        callback(start, end);
        break;
      }
    }
  }

  // isEditingCurrentEntity() {
  //   const selectionState = this.state.editorState.getSelection();
  //   const anchorKey = selectionState.getAnchorKey();
  //   const currentContent = this.state.editorState.getCurrentContent();
  //   const currentContentBlock = currentContent.getBlockForKey(anchorKey);
  //   const start = selectionState.getStartOffset();
  //   // const end = selectionState.getEndOffset();
  //   const key = currentContentBlock.getEntityAt(start);
  //   if (key) {
  //     const entity = currentContent.getEntity(key);
  //     console.log("Found one!", entity.getData());
  //   }
  // }

  keyBindingFn(e) {
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
        console.log("move-up");
        return "handled";
      }
      case "move-down": {
        const suggestions = getMatchingEntries(this.state.textToMatch);
        const index = suggestions.indexOf(this.state.selected);
        if (index === -1) this.setState({ selected: suggestions[0] });
        if (index < suggestions.length - 1) {
          this.setState({ selected: suggestions[index + 1] });
          console.log("move-down");
        }
        return "handled";
      }
      case "validate":
        this.validate();
        // console.log(newEditorState);
        return "handled";
      default:
        return "not-handled";
    }
  }
  validate() {
    const selected = this.state.selected || this.state.textToMatch;
    const editorState = replaceMatchedTextByEntity(
      this.state.editorState,
      this.state.textToMatchPosition.start,
      this.state.textToMatchPosition.end,
      selected
    );
    console.log("here");
    this.setState({ editorState, selected: "" });
  }

  render() {
    return (
      <div style={styles.root}>
        <suggestionContext.Provider
          value={{
            selected: this.state.selected,
            suggestions: getMatchingEntries(this.state.textToMatch),
            onSelectSuggestion: textToMatch => {
              this.setState({ textToMatch, isCurrentlyAutocompleting: false });
              this.validate();
            },
            setTextToMatch: textToMatch => this.setState({ textToMatch }),
            isCurrentlyAutocompleting: isCurrentlyAutocompleting => {
              // if prob not required, but hey.
              if (
                this.state.isCurrentlyAutocompleting !==
                isCurrentlyAutocompleting
              ) {
                this.setState({ isCurrentlyAutocompleting, selected: "" });
              }
            }
          }}
        >
          <div
            style={{
              ...styles.editor,
              backgroundColor: this.state.isCurrentlyAutocompleting
                ? "red"
                : "white"
            }}
            onClick={this.focus}
          >
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
          <input
            onClick={this.logState.bind(this)}
            style={styles.button}
            type="button"
            value="Log State"
          />
        </suggestionContext.Provider>
        {this.state.textToMatchPosition.start}
        {this.state.textToMatchPosition.end}
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

function App() {
  return (
    <div className="App">
      <IdeaflowEditor />
    </div>
  );
}

export default App;
