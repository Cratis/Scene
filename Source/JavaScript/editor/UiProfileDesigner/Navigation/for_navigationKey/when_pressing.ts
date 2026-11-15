// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { NavigationKeyAction, navigationKeyAction } from '../navigationKey';

describe('when Escape is pressed while peeking', () => {
    it('should leave the peek, also in preview', () => {
        navigationKeyAction('Escape', { previewing: false, peeking: true, onPeekBar: false }).should.equal(NavigationKeyAction.LeavePeek);
        navigationKeyAction('Escape', { previewing: true, peeking: true, onPeekBar: false }).should.equal(NavigationKeyAction.LeavePeek);
    });
});

describe('when Escape is pressed in preview with nothing to leave', () => {
    it('should leave the preview', () => navigationKeyAction('Escape', { previewing: true, peeking: false, onPeekBar: false }).should.equal(NavigationKeyAction.ExitPreview));
});

describe('when Escape is pressed in design with nothing to leave', () => {
    it('should do nothing', () => navigationKeyAction('Escape', { previewing: false, peeking: false, onPeekBar: false }).should.equal(NavigationKeyAction.None));
});

describe('when Enter is pressed on the peek bar', () => {
    it('should open the peeked destination in the editor', () => navigationKeyAction('Enter', { previewing: false, peeking: true, onPeekBar: true }).should.equal(NavigationKeyAction.OpenInEditor));
});

describe('when Shift+Enter is pressed anywhere while peeking', () => {
    it('should open the peeked destination in the editor', () => navigationKeyAction('Enter', { previewing: false, peeking: true, onPeekBar: false }, true).should.equal(NavigationKeyAction.OpenInEditor));
});

describe('when Enter is pressed on a navigation item', () => {
    it('should leave the activation to the item', () => navigationKeyAction('Enter', { previewing: false, peeking: true, onPeekBar: false }).should.equal(NavigationKeyAction.None));
});
