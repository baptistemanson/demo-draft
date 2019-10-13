import { EditorState, Modifier } from "draft-js";

const entityTypeMap = { "@": "person", "#": "hashtag", "<": "relation" };

export const replaceMatchedTextByEntity = (
  editorState,
  block,
  start,
  end,
  rawText,
  forceSelection = false
) => {
  const text = rawText.trim();
  // I couldn't assume the current selection was the one we were trying to replace.
  // selection is off by one in size when using the delete key, i have no clue why.
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
  // @todo Should probably be another global state of input, as if someone's input a "." ro a "," just after a tab, we should probably autoremove the inserted whitespace.
  contentState = Modifier.insertText(
    contentState,
    contentState.getSelectionAfter(),
    " "
  );

  editorState = EditorState.push(editorState, contentState, "replace-entity");

  // restore cursor position before edits if the edits were the result of a click elsewhere.
  if (selectionState.focusOffset !== end && !forceSelection) {
    editorState = EditorState.forceSelection(editorState, selectionState);
  }
  // if the insertion comes from an interaction w the focus outside of the edit, like via clicking on a tooltip
  if (forceSelection) {
    const afterAutocompleteSelection = updatedSelection.merge({
      anchorOffset: updatedSelection.getAnchorOffset() + text.length + 1,
      focusOffset: updatedSelection.getAnchorOffset() + text.length + 1
    });
    editorState = EditorState.forceSelection(
      editorState,
      afterAutocompleteSelection
    );
  }

  return editorState;
};
