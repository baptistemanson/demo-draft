import React from "react";
export default props => (
  <div
    style={{
      height: "22px",
      backgroundColor: props.selected ? "lightyellow" : "white",
      whiteSpace: "nowrap"
    }}
    onClick={props.onClick}
    dangerouslySetInnerHTML={{ __html: props.entry.html }}
  ></div>
);
