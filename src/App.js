import React from "react";
// @todo reset current word when selecting around...

import SpanHashtag from "./SpanHashtag";
import SpanPerson from "./SpanPerson";
import SpanRelation from "./SpanRelation";

import SuggestionsBox from "./SuggestionsBox";
import defaultContent from "./defaultContent";
import suggestionContext from "./suggestionContext";

import {
  EditorState,
  Editor,
  CompositeDecorator,
  convertFromRaw,
  convertToRaw
} from "draft-js";

class IdeaflowEditor extends React.Component {
  constructor() {
    super();
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
        strategy: findByPattern,
        component: SuggestionsBox
      }
    ]);
    const blocks = convertFromRaw(defaultContent);
    this.state = {
      editorState: EditorState.createWithContent(blocks, decorator),
      autocompleteEntityType: null,
      selected: ""
    };
    this.focus = () => this.refs.editor.focus();
    this.onChange = editorState => this.setState({ editorState });
  }

  logState() {
    console.log(convertToRaw(this.state.editorState.getCurrentContent()));
  }

  isEditingCurrentEntity() {
    const selectionState = this.state.editorState.getSelection();
    const anchorKey = selectionState.getAnchorKey();
    const currentContent = this.state.editorState.getCurrentContent();
    const currentContentBlock = currentContent.getBlockForKey(anchorKey);
    const start = selectionState.getStartOffset();
    // const end = selectionState.getEndOffset();
    const key = currentContentBlock.getEntityAt(start);
    if (key) {
      const entity = currentContent.getEntity(key);
      console.log("Found one!", entity.getData());
    }
  }

  render() {
    return (
      <div style={styles.root}>
        <suggestionContext.Provider
          value={{
            selected: this.state.selected,
            onChange: selected => this.setState({ selected })
          }}
        >
          <div
            style={{
              ...styles.editor,
              backgroundColor: this.state.isCurrentlyAutocompleting
                ? "red"
                : "none"
            }}
            onClick={this.focus}
          >
            <Editor
              editorState={this.state.editorState}
              onChange={this.onChange}
              placeholder="Write a tweet..."
              ref="editor"
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

function findByPattern(contentBlock, callback, contentState) {
  const text = contentBlock.getText();
  const regexp = /@[\w]+/g;
  let matchArr, start;
  while ((matchArr = regexp.exec(text)) !== null) {
    start = matchArr.index;
    callback(start, start + matchArr[0].length);
  }
}

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
