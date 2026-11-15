// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createExternalComponent } from '../../Document/createExternalComponent';
import { createPanel } from '../../Document/createPanel';
import { createScreenDocument, screenRootId, studioLayout } from '../../Document/studioScreen';
import { LayoutItem } from '../../Layouts/LayoutItem';
import { readThumbnailDocument } from '../readThumbnailDocument';

describe('when reading a document for the board', () => {
    const text = JSON.stringify(createScreenDocument(createPanel(LayoutItem.Stack, screenRootId, 'Screen')));

    it('should read a document the editor saved', () => (readThumbnailDocument(text) !== undefined).should.be.true);
    it('should give the same document for the same text, without reading it again', () => (readThumbnailDocument(text) === readThumbnailDocument(text)).should.be.true);
    it('should read nothing from no text', () => (readThumbnailDocument(undefined) === undefined && readThumbnailDocument('') === undefined).should.be.true);
    it('should read nothing from text that is not json', () => (readThumbnailDocument('{ not json') === undefined).should.be.true);
    it('should read nothing from a document without a screen', () => (readThumbnailDocument('{"layouts":[],"screenTemplates":[],"dialogTemplates":[],"screens":[],"exposures":[],"instanceContributions":[]}') === undefined).should.be.true);
});

describe('when reading the document of a screen template for the board', () => {
    const template = { name: 'grid', slots: [{ name: 'header' }, { name: 'products' }], content: { header: [createExternalComponent('grid-title', 'Title', 'title', { text: 'Products' })] } };
    const text = JSON.stringify({ layouts: [studioLayout], screenTemplates: [template], dialogTemplates: [], screens: [], exposures: [], instanceContributions: [] });
    const document = readThumbnailDocument(text);

    it('should draw it as a screen that uses the template', () => document!.screens[0].screenTemplate!.should.equal('grid'));
    it('should leave every slot of the template to the template', () => Object.keys(document!.screens[0].slotContent).should.be.empty);
    it('should keep the template as it is', () => document!.screenTemplates.should.deep.equal([template]));
    it('should read nothing from a document that holds more than one template', () =>
        (readThumbnailDocument(JSON.stringify({ layouts: [studioLayout], screenTemplates: [template, { ...template, name: 'other' }], dialogTemplates: [], screens: [], exposures: [], instanceContributions: [] })) === undefined).should.be.true);
});
