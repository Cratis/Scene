// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

// What takes typing: a key pressed there belongs to the field, never to the screen being edited. A rich text editor, a code or JSON
// field and the controls of a component on the surface are all found by role or class, not only by tag.
const editable = [
    'input', 'textarea', 'select', '[contenteditable=""]', '[contenteditable="true"]', '[contenteditable="plaintext-only"]',
    '[role="textbox"]', '[role="combobox"]', '[role="searchbox"]', '[role="spinbutton"]', '[role="listbox"]', '[role="slider"]',
    '.ql-editor', '.cm-editor', '.monaco-editor', '[data-studio-typing]',
].join(',');

export const isTypingTarget = (target: EventTarget | null): boolean => {
    const element = target as Partial<Element> & { isContentEditable?: boolean } | null;
    return !!element && typeof element.closest === 'function' && (element.closest(editable) !== null || element.isContentEditable === true);
};

// Whether a key press asks to remove the selected element: Delete or Backspace, on its own, nowhere that takes typing. A key held down repeats,
// and each repeat would remove the next element as the selection moves on, so only the first press counts.
export interface DeleteKeyEvent {
    key: string;
    ctrlKey: boolean;
    metaKey: boolean;
    altKey: boolean;
    shiftKey: boolean;
    defaultPrevented: boolean;
    repeat?: boolean;
    target: EventTarget | null;
    nativeEvent?: { isComposing?: boolean };
}

export const isDeleteKey = (event: DeleteKeyEvent): boolean =>
    (event.key === 'Delete' || event.key === 'Backspace')
    && !event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey
    && !event.defaultPrevented && !event.repeat && !event.nativeEvent?.isComposing
    && !isTypingTarget(event.target);
