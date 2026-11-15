// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { InstanceContribution, type SceneDocument } from '@cratis/scene.model';
import { corePackage } from '@cratis/scene.react';
import { createScreenEditorRuntime } from '../../Runtime/screenEditorRuntime';
import { createExternalComponent } from '../../Document/createExternalComponent';
import { createPanel } from '../../Document/createPanel';
import { contentSlot, createScreenDocument, screenName } from '../../Document/studioScreen';
import { LayoutItem } from '../../Layouts/LayoutItem';
import { composePlayScreen } from '../composePlayScreen';
import { PlayScreenView } from '../PlayScreen';

const runtime = createScreenEditorRuntime([corePackage], { name: 'p', targetPlatform: 'web', packages: ['core'] } as never);

const screenWithTemplate = (): SceneDocument => {
    const base = createScreenDocument(createPanel(LayoutItem.Stack, 'root', 'Root', [createExternalComponent('b', 'B', 'button', { label: 'Save' })]), 'Shell');
    const nav = createExternalComponent('nav', 'Nav', 'navigationBar', { items: [{ id: 'home', label: 'Home' }] });
    return { ...base, screenTemplates: [{ name: 'Shell', slots: [{ name: contentSlot }], content: { [contentSlot]: [nav] } }] };
};

const html = (document: SceneDocument) => renderToStaticMarkup(createElement(PlayScreenView, { document, runtime, resolveBinding: () => undefined }));

describe('when playing a screen', () => {
    const markup = html(screenWithTemplate());

    it('should draw the screen\'s own content', () => markup.includes('Save').should.be.true);
    it('should draw what the template contributes', () => markup.includes('data-scene-id="nav"').should.be.true);
    it('should draw the template before the screen, as the editor does', () => (markup.indexOf('data-scene-id="nav"') < markup.indexOf('data-scene-id="root"')).should.be.true);
    it('should carry nothing of the editor\'s chrome', () => /studio-screen-surface|data-ownership|data-prototype-emphasis|selection/.test(markup).should.be.false);
});

describe('when a screen configures what a template exposes', () => {
    const contribution: InstanceContribution = { instance: `screen:${screenName}`, values: [], collections: [] } as never;

    it('should compose with no configuration when nothing was contributed', () => (composePlayScreen(screenWithTemplate(), runtime.catalog).configuration === undefined).should.be.true);
    it('should compose with the configuration Scene resolves when something was', () =>
        (composePlayScreen({ ...screenWithTemplate(), instanceContributions: [contribution] }, runtime.catalog).configuration !== undefined).should.be.true);
});
