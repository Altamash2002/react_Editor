import React, { useEffect, useState } from 'react';
import { Editor, EditorState, Modifier, RichUtils, SelectionState, convertToRaw, convertFromRaw } from 'draft-js';
import 'draft-js/dist/Draft.css';
import './editor.css';

const inlineStyleMap = {
  HEADING: { fontSize: '2.5rem', fontWeight: 'bold', color: 'black', textDecoration: 'underline', textDecorationColor: 'white' },
  BOLD: { fontWeight: 'bold', color: 'black', fontSize: '1rem', textDecoration: 'underline', textDecorationColor: 'white' },
  RED: { color: 'red', fontWeight: 'normal', fontSize: '1rem', textDecoration: 'underline', textDecorationColor: 'white' },
  UNDERLINE: { textDecoration: 'underline', color: 'black', fontSize: '1rem', fontWeight: 'normal', textDecorationColor: 'black' },
};

const LOCAL_STORAGE_KEY = 'editorContent';

const TextEditor = () => {
  const [editorState, setEditorState] = useState(() => {
    // Load saved state from localStorage
    const savedContent = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedContent) {
      const contentState = convertFromRaw(JSON.parse(savedContent));
      return EditorState.createWithContent(contentState);
    }
    return EditorState.createEmpty();
  });

  // Save editor content to localStorage
  const saveContent = () => {
    const contentState = editorState.getCurrentContent();
    const rawContentState = convertToRaw(contentState);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(rawContentState));
    alert('Content saved!');
  };

  const handleBeforeInput = (chars, editorState) => {
    const contentState = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const blockKey = selection.getStartKey();
    const blockText = contentState.getBlockForKey(blockKey).getText();
    const textWithChar = blockText + chars;

    if (/^# $/.test(textWithChar)) {
      setEditorState(applyStyle(editorState, 'HEADING', 2));
      return 'handled';
    } else if (/^\* $/.test(textWithChar)) {
      setEditorState(applyStyle(editorState, 'BOLD', 2));
      return 'handled';
    } else if (/^\*\* $/.test(textWithChar)) {
      setEditorState(applyStyle(editorState, 'RED', 3));
      return 'handled';
    } else if (/^\*\*\* $/.test(textWithChar)) {
      setEditorState(applyStyle(editorState, 'UNDERLINE', 4));
      return 'handled';
    }

    return 'not-handled';
  };

  const handleKeyCommand = (command, editorState) => {
    if (command === 'space') {
      const selection = editorState.getSelection();
      const blockKey = selection.getStartKey();
      const blockText = editorState.getCurrentContent().getBlockForKey(blockKey).getText();

      // Check for special prefixes
      if (blockText.startsWith('# ')) {
        setEditorState(applyStyle(editorState, 'HEADING', 2));
        return 'handled';
      } else if (blockText.startsWith('* ')) {
        setEditorState(applyStyle(editorState, 'BOLD', 2));
        return 'handled';
      } else if (blockText.startsWith('** ')) {
        setEditorState(applyStyle(editorState, 'RED', 3));
        return 'handled';
      } else if (blockText.startsWith('*** ')) {
        setEditorState(applyStyle(editorState, 'UNDERLINE', 4));
        return 'handled';
      }
    }
    return 'not-handled';
  };

  const applyStyle = (editorState, style, removeCount) => {
    const contentState = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const blockKey = selection.getStartKey();
    const blockText = contentState.getBlockForKey(blockKey).getText();
    const newText = blockText.slice(removeCount);
    const newContentState = Modifier.replaceText(
      contentState,
      SelectionState.createEmpty(blockKey).merge({
        anchorOffset: 0,
        focusOffset: blockText.length,
      }),
      newText
    );

    const updatedEditorState = EditorState.push(editorState, newContentState, 'change-inline-style');
    const newSelection = SelectionState.createEmpty(blockKey).merge({
      anchorOffset: 0,
      focusOffset: newText.length,
    });

    const editorStateWithSelection = EditorState.forceSelection(updatedEditorState, newSelection);
    return RichUtils.toggleInlineStyle(editorStateWithSelection, style);
  };

  return (
    <>
      <div className='text-right py-5 px-44'>
        <button className='bg-slate-600 px-6 py-3 text-white text-xl font-bold' onClick={saveContent}>
          SAVE
        </button>
      </div>
      <div className="RichEditor-root">
        <div className="RichEditor-editor">
          <Editor
            editorState={editorState}
            onChange={setEditorState}
            placeholder="Start typing..."
            customStyleMap={inlineStyleMap}
            spellCheck={true}
            handleBeforeInput={(chars) => handleBeforeInput(chars, editorState)}
            handleKeyCommand={(command) => handleKeyCommand(command, editorState)}
          />
        </div>
      </div>
    </>
  );
};

export default TextEditor;
