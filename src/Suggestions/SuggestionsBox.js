import React from "react";
import ReactDOM from "react-dom";
import SuggestionsEntry from "./SuggestionsEntry";

import suggestionsContext from "./suggestionsContext";

import { getMatchingEntries } from "./textMatching";

class SuggestionsPortal extends React.Component {
  static contextType = suggestionsContext;
  state = { selectedIndex: null };

  componentDidMount() {
    this.context.registerActiveBindings(this.myKeys);
  }

  componentWillUnmount() {
    this.context.registerActiveBindings(() => {});
  }

  static getDerivedStateFromProps(props, state) {
    // reset if the selected index in the dropdown is off limits
    const matchingEntries = getMatchingEntries(props.decoratedText);
    if (state.selectedIndex >= matchingEntries.length)
      return { selectedIndex: 0 };
    else return state;
  }

  myKeys = command => {
    const matchingEntries = getMatchingEntries(this.props.decoratedText);
    if (command === "local-move-up") {
      if (this.state.selectedIndex > 0)
        this.setState({ selectedIndex: this.state.selectedIndex - 1 });
      else {
        this.setState({ selectedIndex: null });
      }
      return "handled";
    }
    if (command === "local-move-down") {
      if (this.state.selectedIndex === null) {
        this.setState({ selectedIndex: 0 });
      } else if (this.state.selectedIndex < matchingEntries.length - 1) {
        this.setState({ selectedIndex: this.state.selectedIndex + 1 });
      } else {
        this.setState({ selectedIndex: null }); // warp around
      }
      return "handled";
    }
    if (command === "local-autocomplete") {
      const text =
        this.state.selectedIndex !== null &&
        matchingEntries[this.state.selectedIndex]
          ? matchingEntries[this.state.selectedIndex].text
          : this.props.decoratedText;
      // we selected an autocomplete value
      this.context.replaceSuggestionsByEntity(
        text,
        this.props.blockKey,
        this.props.start,
        this.props.end
      );
    }
  };

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
          {getMatchingEntries(this.props.decoratedText).map((entry, index) => (
            <SuggestionsEntry
              key={entry.text}
              entry={entry}
              onClick={event => {
                this.context.replaceSuggestionsByEntity(
                  entry.text,
                  this.props.blockKey,
                  this.props.start,
                  this.props.end
                );
                event.stopPropagation();
              }}
              selected={this.state.selectedIndex === index}
            />
          ))}
        </div>
      </div>,
      this.context.refSuggestions
    );
  }
}

export default class SuggestionsBox extends React.Component {
  static contextType = suggestionsContext;
  constructor() {
    super();
    this.ref = React.createRef();
    this.state = {
      init: false,
      position: { bottom: 0, left: 0 }
    };
  }

  componentDidMount() {
    this.setState({
      init: true,
      position: this.ref.current.getBoundingClientRect()
    });
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
