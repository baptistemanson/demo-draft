import React from "react";

export default props => {
  return (
    <span
      style={{
        color: "rgba(95, 184, 138, 1.0)",
        direction: "ltr",
        unicodeBidi: "bidi-override"
      }}
      data-offset-key={props.offsetKey}
    >
      {props.children}
    </span>
  );
};
