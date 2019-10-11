export default {
  blocks: [
    {
      text:
        'This is an "immutable" entity: @Superman. Deleting any ' +
        "characters will delete the entire entity. Adding characters " +
        "will remove the entity from the range.",
      type: "unstyled",
      entityRanges: [{ offset: 31, length: 9, key: "first" }]
    },
    {
      text: "",
      type: "unstyled"
    },
    {
      text:
        'This is a "mutable" entity: #Batman. Characters may be added ' +
        "and removed.",
      type: "unstyled",
      entityRanges: [{ offset: 28, length: 7, key: "second" }]
    },
    {
      text: "012345 yoyo Bat",
      type: "unstyled"
    },
    {
      text:
        'This is a "segmented" entity: <>Green Lantern. Deleting any ' +
        'characters will delete the current "segment" from the range. ' +
        "Adding characters will remove the entire entity from the range.",
      type: "unstyled",
      entityRanges: [{ offset: 30, length: 15, key: "third" }]
    }
  ],
  entityMap: {
    first: {
      type: "person",
      mutability: "IMMUTABLE"
    },
    second: {
      type: "hashtag",
      mutability: "IMMUTABLE"
    },
    third: {
      type: "relation",
      mutability: "IMMUTABLE",
      data: { balabl: "johi" }
    }
  }
};
