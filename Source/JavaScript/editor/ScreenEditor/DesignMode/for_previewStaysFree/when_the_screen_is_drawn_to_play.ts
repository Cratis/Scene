// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Design mode is chrome the editor draws over the rendered screen (DM1); the renderers that show the screen as it will be - Play and the thumbnail - must never reach it.
// A screen drawn there is Scene's rendering alone, so none of the toolbar, the "+", the frames, the region tags or the slot outline can be in it.
const editor = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

const sourcesOf = (directory: string): string[] => readdirSync(join(editor, directory), { withFileTypes: true })
    .filter(entry => entry.isFile() && /\.(ts|tsx)$/.test(entry.name) && !entry.name.startsWith('when_'))
    .map(entry => readFileSync(join(editor, directory, entry.name), 'utf8'));

const importsDesignMode = (source: string) => /from\s+'[^']*DesignMode[^']*'/.test(source) || /DesignModeChrome|DesignModeFrames|EditorNavigationScope/.test(source);

describe('when the screen is drawn to play', () => {
    it('should not reach the design-mode code', () => sourcesOf('Play').filter(importsDesignMode).should.be.empty);
});

describe('when the screen is drawn as a thumbnail', () => {
    it('should not reach the design-mode code', () => sourcesOf('Thumbnail').filter(importsDesignMode).should.be.empty);
});

describe('when the editing surface draws design mode', () => {
    it('should draw it in the chrome layer over the rendered screen, which is what makes it absent from a rendering of the screen alone', () => {
        const surface = readFileSync(join(editor, 'Surface', 'ScreenSurface.tsx'), 'utf8');
        surface.should.match(/studio-screen-surface__chrome[\s\S]*<DesignModeFrames[\s\S]*<DesignModeChrome/);
    });
});
