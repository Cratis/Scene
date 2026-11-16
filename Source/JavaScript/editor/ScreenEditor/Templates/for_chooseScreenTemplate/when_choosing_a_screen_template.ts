// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { SceneDocument, ScreenTemplate } from '@cratis/scene.model';
import { createPanel } from '../../Document/createPanel';
import { createScreenDocument } from '../../Document/studioScreen';
import { LayoutItem } from '../../Layouts/LayoutItem';
import { chooseScreenTemplate } from '../chooseScreenTemplate';

const list: ScreenTemplate = { name: 'DataListPage', slots: [{ name: 'content' }], metadata: { category: 'Business / List' } };
const detail: ScreenTemplate = { name: 'DetailPage', slots: [{ name: 'content' }] };
const packaged = [list, detail];
const screen = (): SceneDocument => createScreenDocument(createPanel(LayoutItem.Stack, 'screen-root', 'Screen'));

describe('when choosing a package\'s screen template', () => {
    const document = chooseScreenTemplate(screen(), list, packaged);

    it('should build the screen from it', () => document.screens[0]!.screenTemplate!.should.equal('DataListPage'));
    it('should copy it into the document', () => document.screenTemplates.should.deep.equal([list]));
    it('should copy rather than share it', () => (document.screenTemplates[0] === list).should.be.false);
});

describe('when changing to another template', () => {
    const document = chooseScreenTemplate(chooseScreenTemplate(screen(), list, packaged), detail, packaged);

    it('should build the screen from the new one', () => document.screens[0]!.screenTemplate!.should.equal('DetailPage'));
    it('should take the unchanged copy of the old one out', () => document.screenTemplates.map(template => template.name).should.deep.equal(['DetailPage']));
});

describe('when the old template\'s copy was changed', () => {
    const chosen = chooseScreenTemplate(screen(), list, packaged);
    const changed = { ...chosen, screenTemplates: [{ ...chosen.screenTemplates[0]!, slots: [...chosen.screenTemplates[0]!.slots, { name: 'details', routed: true }] }] };
    const document = chooseScreenTemplate(changed, undefined, packaged);

    it('should build the screen from no template', () => (document.screens[0]!.screenTemplate === undefined).should.be.true);
    it('should keep the changed copy', () => document.screenTemplates[0]!.slots.some(slot => slot.name === 'details').should.be.true);
});

describe('when choosing the template the screen already has', () => {
    const chosen = chooseScreenTemplate(screen(), list, packaged);

    it('should leave the document as it is', () => (chooseScreenTemplate(chosen, list, packaged) === chosen).should.be.true);
});
