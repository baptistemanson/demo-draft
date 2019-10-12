import { EditorState, Modifier } from "draft-js";

const entityTypeMap = { "@": "person", "#": "hashtag", "<": "relation" };

export const replaceMatchedTextByEntity = (
  editorState,
  block,
  start,
  end,
  text
) => {
  // I assumed the current selection is the one we are trying to replace
  const selectionState = editorState.getSelection();
  const updatedSelection = selectionState.merge({
    anchorOffset: start,
    focusOffset: end,
    anchorKey: block.getKey(),
    focusKey: block.getKey()
  });
  let contentState = editorState.getCurrentContent();
  contentState = contentState.createEntity(entityTypeMap[text[0]], "IMMUTABLE");
  const entityKey = contentState.getLastCreatedEntityKey();

  contentState = Modifier.replaceText(
    contentState,
    updatedSelection,
    text,
    null,
    entityKey
  );
  // I added an extra space, because I found it more confortable.
  contentState = Modifier.insertText(
    contentState,
    contentState.getSelectionAfter(),
    " "
  );

  return EditorState.push(editorState, contentState, "replace-entity");
};
