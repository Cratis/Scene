// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { corePackage } from '@cratis/scene.react';
import type { SceneDocument, Theme } from '@cratis/scene.model';
import { createExternalComponent } from '../../Document/createExternalComponent';
import { createPanel } from '../../Document/createPanel';
import { createScreenDocument } from '../../Document/studioScreen';
import { LayoutItem } from '../../Layouts/LayoutItem';
import { createScreenEditorRuntime } from '../../Runtime/screenEditorRuntime';
import { ScreenThumbnail } from '../ScreenThumbnail';
import { thumbnailContent } from '../thumbnailContent';
import { thumbnailGeometry, thumbnailMaxBodyHeight, thumbnailWidth } from '../thumbnailGeometry';

const profile = { name: 'p', targetPlatform: 'web', packages: ['core'] } as never;
const runtime = createScreenEditorRuntime([corePackage], profile);
const dark = { name: 'Host', isDark: true, compatibleWith: [], tokens: {} } as unknown as Theme;

// What the editor saves: a stack holding a navigation bar and a button the author named, a code block set nothing, and a second stack inside the first.
const document = (): SceneDocument => createScreenDocument(createPanel(LayoutItem.Stack, 'root', 'Root', [
    createExternalComponent('nav', 'Nav', 'navigationBar', { items: [{ id: 'home', label: 'Home' }, { id: 'more', label: 'More' }] }),
    createExternalComponent('go', 'Go', 'button', { label: 'Do Stuff' }),
    createExternalComponent('code', 'Code', 'code', {}),
    createPanel(LayoutItem.Row, 'inner', 'Inner', [createExternalComponent('s', 'Switch', 'text', { text: 'Inside' })]),
]));

const draw = (doc: SceneDocument, extra = {}) => renderToStaticMarkup(createElement(ScreenThumbnail, { document: doc, runtime, windowSize: { width: 1280, height: 760 }, ...extra }));

describe('when drawing a screen as a miniature', () => {
    const markup = draw(document());

    it('should draw every component of the document', () => {
        for (const id of ['nav', 'go', 'code', 'inner', 's']) markup.should.include(`data-scene-id="${id}"`);
    });
    it('should show what the author set', () => { markup.should.include('Do Stuff'); markup.should.include('Home'); markup.should.include('Inside'); });
    it('should show the sample content the surface shows where nothing was set, so a code block is not blank', () => markup.should.include('const'));
    it('should show every text the document lists', () => {
        for (const text of thumbnailContent(document()).texts) markup.should.include(text);
    });
    it('should draw nothing of the editor\'s surface', () => /studio-screen-surface|data-studio-element|studio-design-placeholder/.test(markup).should.be.false);
    it('should not take part in interaction', () => markup.should.match(/data-screen-thumbnail-body="" inert/));
    it('should be the shape of the window it was designed in', () => {
        const geometry = thumbnailGeometry({ width: 1280, height: 760 }, thumbnailWidth, thumbnailMaxBodyHeight);
        markup.should.include(`width:${geometry.width}px`);
    });
});

describe('when the host has a look of its own', () => {
    it('should draw in the host\'s scheme, the way Play does', () => draw(document(), { runtime: { ...runtime, appearance: { theme: dark } } }).should.include('cratis-dark'));
});

describe('when pressing the miniature', () => {
    it('should be a button for the keyboard without being a <button>, since the screen inside has buttons of its own', () => {
        const markup = draw(document(), { onClick: () => undefined, openTitle: 'Open' });
        markup.should.include('role="button"');
        markup.should.include('tabindex="0"');
        markup.startsWith('<div').should.be.true;
    });
    it('should be a picture with no handler', () => draw(document()).should.include('role="img"'));
});
