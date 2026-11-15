// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { handleDesignModeKey, type DesignModeKeyEvent } from '../designModeKeys';
import type { DesignModeItem, DesignModeSubject } from '../designModeTypes';
import type { DesignModeState } from '../useDesignMode';

const nothingTyped = { closest: () => null, isContentEditable: false } as unknown as EventTarget;
const onAButton = { closest: (selector: string) => selector.includes('button') ? {} : null, isContentEditable: false } as unknown as EventTarget;
const typing = { closest: (selector: string) => selector.includes('input') ? {} : null, isContentEditable: false } as unknown as EventTarget;

const press = (key: string, rest: Partial<DesignModeKeyEvent> = {}): DesignModeKeyEvent & { taken: () => boolean } => {
    let prevented = false;
    return { key, ctrlKey: false, metaKey: false, altKey: false, shiftKey: false, defaultPrevented: false, target: nothingTyped, preventDefault: () => { prevented = true; }, stopPropagation: () => undefined, taken: () => prevented, ...rest };
};

const item = (rest: Partial<DesignModeItem> = {}): DesignModeItem => ({ id: 'b2', label: 'Cancel', index: 1, count: 3, readOnly: false, values: {}, unlinked: false, ...rest });
const stateWith = (selected: DesignModeItem | undefined, calls: string[]): DesignModeState => ({
    subject: { componentId: 't', componentName: 'core:toolbar', mode: { addActions: [], itemToolbar: [] }, source: {} as never, ...(selected ? { selected } : {}) } as DesignModeSubject,
    renameToken: 0, announcement: '', notice: '',
    pointItem: () => undefined, perform: () => true, add: () => true,
    act: (id: string) => { calls.push(id); return true; },
    rename: () => true,
    deselect: () => { calls.push('deselect'); },
});

describe('when no design-mode component is selected', () => {
    it('should take no key', () => { const calls: string[] = []; const state = { ...stateWith(item(), calls), subject: undefined }; handleDesignModeKey(press('Delete'), state, () => true).should.be.false; calls.should.be.empty; });
});

describe('when Escape is pressed', () => {
    it('should deselect (DM7)', () => { const calls: string[] = []; const event = press('Escape'); handleDesignModeKey(event, stateWith(item(), calls), () => true).should.be.true; calls.should.deep.equal(['deselect']); event.taken().should.be.true; });
    it('should leave it to a field that is being typed in', () => { const calls: string[] = []; handleDesignModeKey(press('Escape', { target: typing }), stateWith(item(), calls), () => true).should.be.false; calls.should.be.empty; });
});

describe('when Delete is pressed on a selected item', () => {
    it('should remove it', () => { const calls: string[] = []; handleDesignModeKey(press('Delete'), stateWith(item(), calls), () => true).should.be.true; calls.should.deep.equal(['delete']); });
    it('should do nothing on a read-only item', () => { const calls: string[] = []; handleDesignModeKey(press('Delete'), stateWith(item({ readOnly: true }), calls), () => true).should.be.false; calls.should.be.empty; });
    it('should not remove while typing a title', () => { const calls: string[] = []; handleDesignModeKey(press('Backspace', { target: typing }), stateWith(item(), calls), () => true).should.be.false; calls.should.be.empty; });
});

describe('when Alt and an arrow are pressed on a selected item', () => {
    for (const [key, action] of [['ArrowUp', 'moveEarlier'], ['ArrowLeft', 'moveEarlier'], ['ArrowDown', 'moveLater'], ['ArrowRight', 'moveLater']])
        it(`should ${action} on ${key}`, () => { const calls: string[] = []; handleDesignModeKey(press(key, { altKey: true }), stateWith(item(), calls), () => true).should.be.true; calls.should.deep.equal([action]); });
    it('should leave the arrow alone without Alt', () => { const calls: string[] = []; handleDesignModeKey(press('ArrowLeft'), stateWith(item(), calls), () => true).should.be.false; calls.should.be.empty; });
});

describe('when Enter is pressed on a selected item', () => {
    it('should move into its title', () => { let focused = false; handleDesignModeKey(press('Enter'), stateWith(item(), []), () => { focused = true; return true; }).should.be.true; focused.should.be.true; });
    it('should leave Enter on a control of the toolbar to that control, so a chip opens from the keyboard', () => { let focused = false; handleDesignModeKey(press('Enter', { target: onAButton }), stateWith(item(), []), () => { focused = true; return true; }).should.be.false; focused.should.be.false; });
    it('should not be taken when there is no title to move into', () => handleDesignModeKey(press('Enter'), stateWith(item(), []), () => false).should.be.false);
});

describe('when only the component is selected, not an item', () => {
    it('should take Escape but not Delete, which removes the component itself', () => { const calls: string[] = []; handleDesignModeKey(press('Delete'), stateWith(undefined, calls), () => true).should.be.false; handleDesignModeKey(press('Escape'), stateWith(undefined, calls), () => true).should.be.true; calls.should.deep.equal(['deselect']); });
});
