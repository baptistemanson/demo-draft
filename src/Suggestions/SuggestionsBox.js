import React from "react";
import ReactDOM from "react-dom";
import SuggestionsEntry from "./SuggestionsEntry";

import suggestionContext from "./suggestionContext";

class SuggestionsPortal extends React.Component {
  static contextType = suggestionContext;

  render() {
    // if we didnt acquire the reference yet.
    if (!this.context.refSuggestions) return null;

    // @todo if border of the screen, the autocomplete should be positioned elsewhere
    return ReactDOM.createPortal(
      <div
        style={{
          backgroundColor: "rgb(255,255,224)",
          zIndex: 1,
          position: "fixed",
          top: this.props.position.bottom + 15,
          left: this.props.position.left,
          cursor: "pointer"
        }}
      >
        <div>
          {this.context.suggestions.map(entry => (
            <SuggestionsEntry
              key={entry.text}
              entry={entry}
              onClick={event => {
                this.context.replaceTextByEntity(entry.text, true);
                event.stopPropagation();
              }}
              selected={this.context.selected === entry.text}
            />
          ))}
        </div>
      </div>,
      this.context.refSuggestions
    );
  }
}

export default class SuggestionsBox extends React.Component {
  static contextType = suggestionContext;
  constructor() {
    super();
    this.ref = React.createRef();
    this.state = { init: false, position: { bottom: 0, left: 0 } };
  }

  componentDidMount() {
    this.setState({
      init: true,
      position: this.ref.current.getBoundingClientRect()
    });
    this.context.isCurrentlyAutocompleting(true);
  }

  componentDidUpdate() {
    // if not carrying the selection anymore, we validate. It will ultimately lead to unmounting this component
    if (this.props.children[0].props.selection === null) {
      this.context.replaceTextByEntity(
        this.props.children[0].props.text,
        false
      );
    }
  }

  componentWillUnmount() {
    this.context.isCurrentlyAutocompleting(false);
  }

  render() {
    return (
      <>
        <span style={{ backgroundColor: "rgb(255,255,224)" }} ref={this.ref}>
          {this.props.children}
        </span>
        <SuggestionsPortal {...this.props} position={this.state.position} />
      </>
    );
  }
}
