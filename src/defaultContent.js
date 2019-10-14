export default {
  blocks: [
    {
      text:
        'This is an "immutable" entity: @Baptiste Manson. Deleting any ' +
        "characters will delete the entire entity. Adding characters " +
        "will remove the entity from the range.",
      type: "unstyled",
      entityRanges: [{ offset: 31, length: 16, key: "first" }]
    },
    {
      text: "",
      type: "unstyled"
    },
    {
      text: "What about: #adastra. Characters may be added and removed.",
      type: "unstyled",
      entityRanges: [{ offset: 12, length: 8, key: "second" }]
    },
    {
      text: "012345 yoyo Bat",
      type: "unstyled"
    },
    {
      text:
        "Relations! <>hello. Deleting any " +
        'characters will delete the current "segment" from the range. ' +
        "Adding characters will remove the entire entity from the range.",
      type: "unstyled",
      entityRanges: [{ offset: 11, length: 7, key: "third" }]
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
      mutability: "IMMUTABLE"
    }
  }
};
