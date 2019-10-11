import React from "react";
import ReactDOM from "react-dom";
import SuggestionsEntry from "./SuggestionsEntry";

import suggestionContext from "./suggestionContext";

const hashtag = ["starwars", "startrek", "big lebowski", "clockwork orange"];
class SuggestionsPortal extends React.Component {
  static contextType = suggestionContext;

  render() {
    console.log(this.context);
    const matchingRegexp = new RegExp(
      `.*${this.props.decoratedText.substr(1)}.*`
    );
    const matchingEntries = hashtag.filter(s => s.match(matchingRegexp));

    return ReactDOM.createPortal(
      <div
        style={{
          backgroundColor: "yellow",
          zIndex: 1,
          position: "fixed",
          top: this.props.position.bottom + 15,
          left: this.props.position.left
        }}
      >
        <div>
          {matchingEntries.map(entry => (
            <SuggestionsEntry
              key={entry}
              entry={entry}
              onClick={() => this.context.onChange(entry)}
              selected={this.context.selected === entry}
            />
          ))}
        </div>
      </div>,
      document.getElementById("suggestions")
    );
  }
}

export default class SuggestionsBox extends React.Component {
  constructor() {
    super();
    this.ref = React.createRef();
    this.state = { init: false };
  }

  componentDidMount() {
    this.setState({ init: true });
  }

  render() {
    return (
      <>
        <span ref={this.ref}>{this.props.children}</span>
        <SuggestionsPortal
          {...this.props}
          position={
            this.state.init
              ? this.ref.current.getBoundingClientRect()
              : { bottom: 0, left: 0 }
          }
        />
      </>
    );
  }
}
