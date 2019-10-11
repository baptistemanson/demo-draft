import React from "react";
export default props => (
  <div style={{ border: 1, borderColor: "black" }} onClick={props.onClick}>
    {props.entry}
  </div>
);
