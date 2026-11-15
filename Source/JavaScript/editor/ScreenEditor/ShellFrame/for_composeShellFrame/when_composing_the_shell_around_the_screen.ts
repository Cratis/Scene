// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ShellKind } from '@cratis/scene.engine';
import { createPanel } from '../../Document/createPanel';
import { createScreenDocument } from '../../Document/studioScreen';
import { LayoutItem } from '../../Layouts/LayoutItem';
import { screenEditorRuntimeForProfile } from '../../Runtime/screenEditorRuntimeForProfile';
import { composeShellFrame, effectiveShellFor, shellContentId } from '../frameInShell';

const document = createScreenDocument(createPanel(LayoutItem.Stack, 'root', 'Root', []));
const runtime = screenEditorRuntimeForProfile(undefined);
const find = (node: unknown, id: string): boolean => {
    if (node === null || typeof node !== 'object') return false;
    if ((node as { id?: string }).id === id) return true;
    return Object.values(node).some(value => Array.isArray(value) ? value.some(item => find(item, id)) : find(value, id));
};

describe('when composing the shell of the default profile around a screen', () => {
    const frame = composeShellFrame(runtime, document);

    it('should resolve to the profile\'s layout', () => frame.shell.kind.should.equal(ShellKind.Layout));
    it('should leave a place for the screen', () => find(frame.element, shellContentId).should.be.true);
    it('should draw the sidebar of the application', () => find(frame.element, 'sidebar').should.be.true);
    it('should be the same shell the engine resolves', () => effectiveShellFor(runtime, document).name.should.equal(frame.shell.name));
});

describe('when the screen is edited', () => {
    const before = composeShellFrame(runtime, document);

    it('should compose the same shell again, so nothing about the screen leaks into it', () => JSON.stringify(composeShellFrame(runtime, { ...document, screens: [] }).element).should.equal(JSON.stringify(before.element)));
});

