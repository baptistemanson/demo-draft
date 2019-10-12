import { EditorState, Modifier } from "draft-js";

const entityTypeMap = { "@": "person", "#": "hashtag", "<": "relation" };

export const replaceMatchedTextByEntity = (
  editorState,
  block,
  start,
  end,
  text
) => {
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

  return EditorState.push(editorState, contentState, "replace-entity");
};
