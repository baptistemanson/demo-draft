import { EditorState, Modifier } from "draft-js";

const entityTypeMap = { "@": "person", "#": "hashtag", "<": "relation" };

export const previousChar = editorState => {
  const selection = editorState.getSelection();
  const contentBlock = editorState
    .getCurrentContent()
    .getBlockForKey(selection.anchorKey);
  if (contentBlock && selection.anchorOffset > 0) {
    return contentBlock.getText()[selection.anchorOffset - 1];
  } else return "";
};
export const startSuggestions = (editorState, letter) => {
  const selection = editorState.getSelection();

  let contentState = editorState.getCurrentContent();
  contentState = contentState.createEntity(`suggestions-${letter}`, "MUTABLE");
  const entityKey = contentState.getLastCreatedEntityKey();

  contentState = Modifier.insertText(
    contentState,
    selection,
    letter,
    null,
    entityKey
  );
  return EditorState.push(editorState, contentState, "start-suggestions");
};

export const startSuggestionsRelation = editorState => {
  let selection = editorState.getSelection();
  selection = selection.merge({
    anchorOffset: selection.getAnchorOffset() - 1,
    focusOffset: selection.getFocusOffset()
  });
  let contentState = editorState.getCurrentContent();
  contentState = contentState.createEntity("suggestions->", "MUTABLE");
  const entityKey = contentState.getLastCreatedEntityKey();

  contentState = Modifier.replaceText(
    contentState,
    selection,
    "<>",
    null,
    entityKey
  );
  return EditorState.push(editorState, contentState, "start-suggestions");
};

export const findEntityByType = type => (
  contentBlock,
  callback,
  contentState
) => {
  contentBlock.findEntityRanges(character => {
    const entityKey = character.getEntity();
    return (
      entityKey !== null &&
      contentState
        .getEntity(entityKey)
        .getType()
        .startsWith(type)
    );
  }, callback);
};

/**
 * Determine if we are currently editing a suggestion AFTER the current edit is applied
 * @param {*} editorState
 */
export const isEditingASuggestion = editorState => {
  let contentState = editorState.getCurrentContent();
  const selection = editorState.getSelection();
  // if previous char is a suggestion entity, we are editing a suggestion :)
  const block = contentState.getBlockForKey(selection.anchorKey);
  let entityKey = block.getEntityAt(selection.getFocusOffset() - 2); // -1: char just typed, -2: char before the char just typed.
  if (selection.getFocusOffset() - 2 < 0) {
    entityKey = block.getEntityAt(0);
  }
  return (
    entityKey !== null &&
    contentState
      .getEntity(entityKey)
      .getType()
      .startsWith("suggestions")
  );
};

/**
 * Determines if we are currently editing a suggestion BEFORE the current edit is applied
 * @param {*} editorState
 */
export const getSuggestionTypePre = editorState => {
  let contentState = editorState.getCurrentContent();
  const selection = editorState.getSelection();
  // if previous char is a suggestion entity, we are editing a suggestion :)
  const block = contentState.getBlockForKey(selection.anchorKey);
  let entityKey = block.getEntityAt(selection.getFocusOffset() - 1); // -1: char just typed, -2: char before the char just typed.
  if (selection.getFocusOffset() - 1 < 0) {
    entityKey = block.getEntityAt(0);
  }
  if (
    entityKey !== null &&
    contentState
      .getEntity(entityKey)
      .getType()
      .startsWith("suggestions")
  ) {
    return contentState.getEntity(entityKey).getType();
  } else return false;
};

/**
 * Find anchor boundary of current entity.
 *
 * Checks each char downwards starting with selection until the entity is not the same as the starting one.
 * @param {} editorState
 */
const findAnchorForSameEntity = (editorState, selection) => {
  const contentState = editorState.getCurrentContent();
  const block = contentState.getBlockForKey(selection.anchorKey);
  const entity = block.getEntityAt(selection.getFocusOffset() - 2); // cursor position of last char -1, previous -2
  let anchorOffset = selection.getFocusOffset() - 1;
  while (block.getEntityAt(anchorOffset - 1) !== entity && anchorOffset >= 0) {
    anchorOffset--;
  }
  return [anchorOffset, entity];
};

export const expandSuggestion = editorState => {
  const selection = editorState.getSelection();
  let contentState = editorState.getCurrentContent();
  const [anchorOffset, entityKey] = findAnchorForSameEntity(
    editorState,
    editorState.getSelection()
  );
  const wholeSuggestionSelection = selection.merge({
    anchorOffset,
    focusOffset: selection.getFocusOffset()
  });
  contentState = Modifier.applyEntity(
    contentState,
    wholeSuggestionSelection,
    entityKey
  );
  editorState = EditorState.push(editorState, contentState, "small");
  editorState = EditorState.forceSelection(editorState, selection);
  return editorState;
};

export const autocomplete = (editorState, text, blockKey, start, end) => {
  const selectionState = editorState.getSelection();
  let contentState = editorState.getCurrentContent();
  const block = contentState.getBlockForKey(blockKey);

  const updatedSelection = selectionState.merge({
    anchorOffset: start,
    focusOffset: end,
    anchorKey: block.getKey(),
    focusKey: block.getKey()
  });
  contentState = contentState.createEntity(
    entityTypeMap[text[0]],
    "IMMUTABLE",
    {}
  );
  const entityKey = contentState.getLastCreatedEntityKey();

  contentState = Modifier.replaceText(
    contentState,
    updatedSelection,
    text,
    null,
    entityKey
  );
  // I added an extra space, because I found it more confortable.
  // @todo Should probably be another global state of input, as if someone's input a "." ro a "," just after a tab, we should probably autoremove the inserted whitespace.
  contentState = Modifier.insertText(
    contentState,
    contentState.getSelectionAfter(),
    " "
  );

  editorState = EditorState.push(editorState, contentState, "replace-entity");

  // if the insertion comes from an interaction w the focus outside of the edit, like via clicking on a tooltip
  const afterAutocompleteSelection = updatedSelection.merge({
    anchorOffset: updatedSelection.getAnchorOffset() + text.length + 1,
    focusOffset: updatedSelection.getAnchorOffset() + text.length + 1
  });
  editorState = EditorState.forceSelection(
    editorState,
    afterAutocompleteSelection
  );
  return editorState;
};
