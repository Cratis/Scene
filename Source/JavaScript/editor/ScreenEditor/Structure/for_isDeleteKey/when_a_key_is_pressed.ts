// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { isDeleteKey, type DeleteKeyEvent } from '../isDeleteKey';

// A stand-in for an element: it answers `closest` for the selectors the guard asks about, the way a document would.
const element = (matches: (selector: string) => boolean, isContentEditable = false) => ({ closest: (selector: string) => matches(selector) ? {} : null, isContentEditable }) as unknown as EventTarget;
const nothingTyped = element(() => false);
const typingIn = (tag: string) => element(selector => selector.split(',').includes(tag));

const press = (key: string, overrides: Partial<DeleteKeyEvent> = {}): DeleteKeyEvent =>
    ({ key, ctrlKey: false, metaKey: false, altKey: false, shiftKey: false, defaultPrevented: false, target: nothingTyped, ...overrides });

describe('when Delete is pressed on the surface', () => { it('should ask to remove', () => isDeleteKey(press('Delete')).should.be.true); });
describe('when Backspace is pressed in the structure', () => { it('should ask to remove', () => isDeleteKey(press('Backspace')).should.be.true); });
describe('when another key is pressed', () => { it('should not ask to remove', () => isDeleteKey(press('x')).should.be.false); });
describe('when Delete is pressed with a modifier', () => {
    it('should leave Ctrl alone', () => isDeleteKey(press('Delete', { ctrlKey: true })).should.be.false);
    it('should leave Meta alone', () => isDeleteKey(press('Backspace', { metaKey: true })).should.be.false);
    it('should leave Alt alone', () => isDeleteKey(press('Delete', { altKey: true })).should.be.false);
    it('should leave Shift alone', () => isDeleteKey(press('Delete', { shiftKey: true })).should.be.false);
});
describe('when something has already handled the key', () => { it('should not ask to remove', () => isDeleteKey(press('Delete', { defaultPrevented: true })).should.be.false); });
describe('when the key is held down', () => {
    it('should remove on the first press only', () => { isDeleteKey(press('Delete')).should.be.true; isDeleteKey(press('Delete', { repeat: true })).should.be.false; });
    it('should ignore a repeating Backspace too', () => isDeleteKey(press('Backspace', { repeat: true })).should.be.false);
});

describe('when the key is part of composing text', () => { it('should not ask to remove', () => isDeleteKey(press('Backspace', { nativeEvent: { isComposing: true } })).should.be.false); });

describe('when typing in a field', () => {
    for (const tag of ['input', 'textarea', 'select', '.ql-editor', '[role="textbox"]', '[role="combobox"]', '[contenteditable="true"]', '[data-studio-typing]'])
        it(`should not ask to remove in ${tag}`, () => isDeleteKey(press('Backspace', { target: typingIn(tag) })).should.be.false);

    it('should not ask to remove in an element that reports itself editable', () => isDeleteKey(press('Delete', { target: element(() => false, true) })).should.be.false);
});

describe('when the key comes from nowhere in particular', () => { it('should ask to remove', () => isDeleteKey(press('Delete', { target: null })).should.be.true); });
