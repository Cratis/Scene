// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ShellPointer, decideShellPointer, navigationEntrySelector, screenSelector } from '../decideShellPointer';

// A stand-in for an element that answers `closest` for the selectors the decision asks about.
const within = (...selectors: string[]) => ({ closest: (selector: string) => selectors.includes(selector) ? ({} as HTMLElement) : null }) as unknown as EventTarget;

describe('when the shell is not drawn', () => {
    it('should leave every press to the screen', () => decideShellPointer(within(), false).should.equal(ShellPointer.NotShell));
});

describe('when the press is on the screen', () => {
    it('should leave it to the screen', () => decideShellPointer(within(screenSelector), true).should.equal(ShellPointer.NotShell));
});

describe('when the press is on a navigation entry of the shell', () => {
    it('should leave it to Scene so the destination can be peeked at', () => decideShellPointer(within(navigationEntrySelector), true).should.equal(ShellPointer.Navigate));
});

describe('when the press is on the screen inside a navigation entry', () => {
    it('should still be the screen\'s', () => decideShellPointer(within(screenSelector, navigationEntrySelector), true).should.equal(ShellPointer.NotShell));
});

describe('when the press is anywhere else on the shell', () => {
    it('should do nothing', () => decideShellPointer(within(), true).should.equal(ShellPointer.Ignore));
});
