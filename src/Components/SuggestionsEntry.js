import React from "react";
export default props => (
  <div
    style={{
      border: 1,
      borderColor: "black",
      backgroundColor: props.selected ? "lightyellow" : "white"
    }}
    onClick={props.onClick}
  >
    {props.entry}
  </div>
);
