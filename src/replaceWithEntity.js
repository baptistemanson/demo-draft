import { EditorState, Modifier } from "draft-js";

export const replaceMatchedTextByEntity = (editorState, start, end, text) => {
  // I assumed the current selection is the one we are trying to replace
  const selectionState = editorState.getSelection();
  const updatedSelection = selectionState.merge({
    anchorOffset: start,
    focusOffset: end
  });
  const contentState = editorState.getCurrentContent();
  const contentStateWithEntity = contentState.createEntity(
    "person",
    "IMMUTABLE"
  );
  const entityKey = contentStateWithEntity.getLastCreatedEntityKey();

  const contentStateWithReplacedText = Modifier.replaceText(
    contentStateWithEntity,
    updatedSelection,
    text,
    null,
    entityKey
  );

  return EditorState.push(
    editorState,
    contentStateWithReplacedText,
    "replace-entity"
  );
};
