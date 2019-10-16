import React from "react";

import {
  Editor,
  EditorState,
  CompositeDecorator,
  getDefaultKeyBinding
} from "draft-js";
import suggestionsContext from "./Suggestions/suggestionsContext";

import SpanHashtag from "./Content/SpanHashtag";
import SpanPerson from "./Content/SpanPerson";
import SpanRelation from "./Content/SpanRelation";
import SuggestionsBox from "./Suggestions/SuggestionsBox";

import {
  findEntityByType,
  autocomplete,
  isEditingASuggestion,
  isEditingASuggestionPre,
  expandSuggestion,
  startSuggestions,
  startSuggestionsRelation,
  previousChar
} from "./DraftUtils";

class IdeaflowEditor extends React.Component {
  activeBindings = () => {};

  constructor() {
    super();
    this.refSuggestions = React.createRef();
    const decorator = new CompositeDecorator([
      {
        strategy: findEntityByType("suggestions"),
        component: SuggestionsBox
      },
      {
        strategy: findEntityByType("person"),
        component: SpanPerson
      },
      {
        strategy: findEntityByType("hashtag"),
        component: SpanHashtag
      },
      {
        strategy: findEntityByType("relation"),
        component: SpanRelation
      }
    ]);

    this.state = {
      editorState: EditorState.set(EditorState.createEmpty(decorator), {
        allowUndo: false
      })
    };
    this.focus = () => this.refs.editor.focus();

    this.onChange = editorState => {
      if (!editorState) return;

      if (isEditingASuggestion(editorState)) {
        editorState = expandSuggestion(editorState);
      }
      this.setState({
        editorState
      });
    };
  }
  replaceByEntity = (text, blockKey, start, end) => {
    this.setState({
      editorState: autocomplete(
        this.state.editorState,
        text,
        blockKey,
        start,
        end
      )
    });
  };

  bindKeys = e => {
    const isInEdit = isEditingASuggestionPre(this.state.editorState);
    if (e.key === "@") {
      return "start-suggestions-@";
    }
    if (e.key === "#") {
      return "start-suggestions-#";
    }
    if (e.key === ">" && previousChar(this.state.editorState) === "<") {
      return "start-suggestions->";
    }
    if (e.keyCode === 38 && isInEdit) {
      return "local-move-up";
    }
    if (e.keyCode === 40 && isInEdit) {
      return "local-move-down";
    }
    if (e.keyCode === 13 && isInEdit) {
      return "local-autocomplete";
    }
    if (e.keyCode === 9 && isInEdit) {
      return "local-autocomplete";
    }
    // @todo add the space for #
    return getDefaultKeyBinding(e);
  };

  handleKeyCommand = command => {
    if (command.startsWith("local")) {
      this.activeBindings(command);
      return "handled";
    }
    if (command === "start-suggestions-@") {
      this.onChange(startSuggestions(this.state.editorState, "@"));
      return "handled";
    }
    if (command === "start-suggestions-#") {
      this.onChange(startSuggestions(this.state.editorState, "#"));
      return "handled";
    }
    if (command === "start-suggestions->") {
      this.onChange(startSuggestionsRelation(this.state.editorState));
      return "handled";
    }
    return "not-handled";
  };

  render() {
    return (
      <suggestionsContext.Provider
        value={{
          refSuggestions: this.refSuggestions.current,
          replaceSuggestionsByEntity: (text, blockKey, start, end) => {
            this.replaceByEntity(text, blockKey, start, end);
          },
          registerActiveBindings: f => {
            this.activeBindings = f;
          }
        }}
      >
        <div style={styles.root}>
          <div style={styles.editor}>
            <Editor
              editorState={this.state.editorState}
              onChange={this.onChange}
              keyBindingFn={this.bindKeys}
              handleKeyCommand={this.handleKeyCommand}
              placeholder="Write some text..."
              ref="editor"
            />
          </div>
          <div ref={this.refSuggestions} />
        </div>
      </suggestionsContext.Provider>
    );
  }
}

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
  },
  handle: {
    color: "red"
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
