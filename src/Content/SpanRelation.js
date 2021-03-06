import React from "react";

export default props => {
  return (
    <span
      style={{
        color: "rgba(177, 100, 24, 1.0)",
        direction: "ltr",
        unicodeBidi: "bidi-override"
      }}
      data-offset-key={props.offsetKey}
    >
      {props.children}
    </span>
  );
};
