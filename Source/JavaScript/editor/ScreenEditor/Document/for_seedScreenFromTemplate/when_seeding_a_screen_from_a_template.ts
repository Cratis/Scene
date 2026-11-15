// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { LayoutItem } from '../../Layouts/LayoutItem';
import { createExternalComponent } from '../../Document/createExternalComponent';
import { createPanel } from '../../Document/createPanel';
import { authoredRoot, createScreenDocument, createTemplateDocument } from '../studioScreen';
import { readSceneDocument } from '../readSceneDocument';
import { seedScreenFromTemplate } from '../seedScreenFromTemplate';

const template = (name: string) => JSON.stringify({
    ...createTemplateDocument(name, createPanel(LayoutItem.Stack, 'root', 'Root', [createExternalComponent('nav', 'Navigation', 'navigationBar')])),
    exposures: [{ owner: name, properties: [{ component: 'nav', path: 'items' }] }],
});

const seededDocument = () => {
    const read = readSceneDocument(seedScreenFromTemplate(template('t-1'), 't-1'));
    if (!read.readable) throw new Error('the seeded screen could not be read');
    return read.document;
};

describe('when seeding a screen from a template that has a document', () => {
    it('should be a screen the editor can open', () => readSceneDocument(seedScreenFromTemplate(template('t-1'), 't-1')).readable.should.be.true);
    it('should copy the template\'s content', () => (authoredRoot(seededDocument()) as unknown as { children: { id: string }[] }).children.map(child => child.id).should.deep.equal(['nav']));
    it('should not copy what the template exposes', () => seededDocument().exposures.should.deep.equal([]));
    it('should not make the screen depend on the template', () => (seededDocument().screens[0].screenTemplate === undefined).should.be.true);
});

describe('when seeding a screen from a template that has no usable document', () => {
    it('should seed nothing when it was never saved from the editor', () => (seedScreenFromTemplate(undefined, 't-1') === undefined).should.be.true);
    it('should seed nothing when it cannot be read', () => (seedScreenFromTemplate('{oops', 't-1') === undefined).should.be.true);
    it('should seed nothing when the document is for another template', () => (seedScreenFromTemplate(template('other'), 't-1') === undefined).should.be.true);
    it('should seed nothing from a screen document', () => (seedScreenFromTemplate(JSON.stringify(createScreenDocument(createPanel(LayoutItem.Stack, 'r', 'R'))), 't-1') === undefined).should.be.true);
});
