import React from "react";

export default props => {
  return (
    <span
      style={{
        color: "rgba(98, 177, 254, 1.0)",
        direction: "ltr",
        unicodeBidi: "bidi-override",
        textTransform: "capitalize"
      }}
      data-offset-key={props.offsetKey}
    >
      {props.children}
    </span>
  );
};
