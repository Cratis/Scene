// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { describe, expect, it } from 'vitest';
import { screenDocumentsOfSlice } from '../screenDocumentsOfSlice';
import type { ScreenDirectiveSyntax, ScreenSyntax } from '../Syntax/ScreenplaySyntax';

const sliceId = 'f0f4a0d0-0000-4000-8000-000000000001';
const screen = (name: string, ...directives: ScreenDirectiveSyntax[]): ScreenSyntax => ({ name, directives });
const title = (text: string): ScreenDirectiveSyntax => ({ kind: 'ScreenTitleSyntax', text } as ScreenDirectiveSyntax);
const navigate: ScreenDirectiveSyntax = { kind: 'ScreenNavigateSyntax', screen: 'Other', by: null } as ScreenDirectiveSyntax;
const interaction: ScreenDirectiveSyntax = { kind: 'ScreenBehaviorSyntax' };

describe('when a screen states something this bridge cannot draw', () => {
    const imported = screenDocumentsOfSlice({ sliceId, screens: [screen('Orders', title('Orders'), navigate)] });

    it('should still draw what it can', () => expect(imported.documents).toHaveLength(1));
    it('should keep the title in the document', () => expect(imported.documents[0].document).toContain('core:title'));
    it('should say what it left out', () => expect(imported.findings.map(finding => finding.message)).toEqual(['a navigation is drawn by Studio but is not carried into the screen this board draws']));
    it('should say which screen it was', () => expect(imported.findings[0].screen).toEqual('Orders'));
    it('should never throw', () => expect(() => screenDocumentsOfSlice({ sliceId, screens: [screen('Orders', navigate)] })).not.toThrow());
});

describe('when a screen states an interaction', () => {
    const imported = screenDocumentsOfSlice({ sliceId, screens: [screen('Orders', title('Orders'), interaction)] });

    it('should report it rather than quietly losing it', () => expect(imported.findings[0].message).toContain('an interaction'));
    it('should still draw the screen', () => expect(imported.documents).toHaveLength(1));
});

describe('when a screen states the same thing it cannot draw twice', () => {
    const imported = screenDocumentsOfSlice({ sliceId, screens: [screen('Orders', navigate, navigate)] });

    it('should say it once', () => expect(imported.findings).toHaveLength(1));
});

describe('when a screen keeps its design in a file', () => {
    // Screenplay's TypeScript compiler recognizes `screen <Name> file "<path>"` but does not model the reference,
    // so such a screen arrives with no directives at all and there is nothing here to read.
    const imported = screenDocumentsOfSlice({ sliceId, screens: [screen('Orders')] });

    it('should draw no screen', () => expect(imported.documents).toHaveLength(0));
    it('should say the backend is the one that can read it', () => expect(imported.findings[0].message).toContain('read only by the Studio backend'));
});

describe('when a slice has no screen at all', () => {
    const imported = screenDocumentsOfSlice({ sliceId, screens: [] });

    it('should draw nothing', () => expect(imported.documents).toHaveLength(0));
    it('should have nothing to say', () => expect(imported.findings).toHaveLength(0));
});

describe('when a document declares personas', () => {
    const imported = screenDocumentsOfSlice({
        sliceId,
        screens: [screen('Buyer', title('Yours')), screen('Seller', title('Theirs')), screen('Printout', title('Printout'))],
        roles: new Set(['Buyer', 'Seller']),
    });

    it('should draw one document per role and one for the screens of their own', () => expect(imported.documents).toHaveLength(3));
    it('should name the roles', () => expect(imported.documents.map(document => document.roleName)).toEqual(['Buyer', 'Seller', undefined]));
});
