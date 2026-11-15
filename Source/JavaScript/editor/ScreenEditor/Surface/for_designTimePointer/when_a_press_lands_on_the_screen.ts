// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { decideDesignTimePointer, designTimePointerEvents, elementIdAt, itemIdAt } from '../designTimePointer';

// A stand-in for an element: it answers `closest` the way a document would, for the selectors the surface asks about.
const element = (matches: (selector: string) => HTMLElement | null) => ({ closest: matches }) as unknown as EventTarget;
const plain = element(() => null);
const typing = element(selector => selector.includes('input') ? ({} as HTMLElement) : null);

describe('when a press lands on a component', () => {
    it('should select the element when the pointer goes down, since a disabled control never hears the click', () => decideDesignTimePointer('pointerdown', plain, 0).select.should.be.true);
    it('should select the element on a click, for a click that did not come from a pointer', () => decideDesignTimePointer('click', plain).select.should.be.true);
    it('should not select on a press of another button', () => decideDesignTimePointer('pointerdown', plain, 2).select.should.be.false);
    it('should not select on the other presses', () => {
        for (const type of ['pointerup', 'mousedown', 'mouseup', 'dblclick']) decideDesignTimePointer(type, plain).select.should.be.false;
    });
    it('should keep every press from the component, whatever the component does with it', () => {
        for (const type of designTimePointerEvents) decideDesignTimePointer(type, plain).swallow.should.be.true;
    });
    it('should cancel what the browser would do with a click, such as following a link', () => decideDesignTimePointer('click', plain).cancelDefault.should.be.true);
    it('should leave the default of the presses before the click, so focus still moves', () => decideDesignTimePointer('mousedown', plain).cancelDefault.should.be.false);
    it('should cover the events menus, tab views, toolbars and navigation bars act on', () => {
        for (const type of ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'click', 'dblclick']) designTimePointerEvents.should.include(type as never);
    });
});

describe('when a press lands in a field that takes typing', () => {
    it('should still select the element', () => decideDesignTimePointer('click', typing).select.should.be.true);
    it('should let the field hear it, so a caret can be placed', () => decideDesignTimePointer('mousedown', typing).swallow.should.be.false);
    it('should not cancel the browser default', () => decideDesignTimePointer('click', typing).cancelDefault.should.be.false);
});

describe('when finding the element a press belongs to', () => {
    const hit = (dataset: Record<string, string>) => element(() => ({ dataset }) as unknown as HTMLElement);

    it('should use the scene id of the innermost element', () => (elementIdAt(hit({ sceneId: 'nav' })) ?? '').should.equal('nav'));
    it('should use the editor wrapper when the node has no scene id', () => (elementIdAt(hit({ studioElement: 'wrapped' })) ?? '').should.equal('wrapped'));
    it('should use the element a stand-in stands for', () => (elementIdAt(hit({ studioPlaceholderFor: 'overlay' })) ?? '').should.equal('overlay'));
    it('should answer nothing for the empty part of the surface', () => (elementIdAt(plain) === undefined).should.be.true);
    it('should answer nothing when there is no target', () => (elementIdAt(null) === undefined).should.be.true);
});

describe('when finding the item a press belongs to', () => {
    const hit = (dataset: Record<string, string>) => element(selector => selector.includes('data-scene-outlet-item') ? ({ dataset }) as unknown as HTMLElement : null);

    it('should use the item of an outlet', () => (itemIdAt(hit({ sceneOutletItem: 'new-order' })) ?? '').should.equal('new-order'));
    it('should answer nothing outside every item', () => (itemIdAt(plain) === undefined).should.be.true);
});

describe('when a press lands on a disabled button of an outlet', () => {
    // The press falls through a disabled button to its outlet, so the item is the one whose box holds the pointer.
    const box = (left: number) => ({ left, right: left + 100, top: 0, bottom: 40 });
    const item = (id: string, left: number) => ({ dataset: { sceneOutletItem: id }, getBoundingClientRect: () => box(left) });
    const outlet = { closest: () => null, querySelectorAll: () => [item('new', 0), item('approve', 100)] } as unknown as EventTarget;

    it('should use the item under the pointer', () => (itemIdAt(outlet, { x: 150, y: 10 }) ?? '').should.equal('approve'));
    it('should answer nothing between the items', () => (itemIdAt(outlet, { x: 150, y: 80 }) === undefined).should.be.true);
    it('should answer nothing without a point', () => (itemIdAt(outlet) === undefined).should.be.true);
});
