// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ScreenTemplate } from '@cratis/scene.model';
import { copiedBlueprintDocument, duplicatedDocument } from '../templateDocuments';

const blueprintTemplate = {
    name: 'MasterDetail', displayName: 'Master detail', fitsSlot: 'content', slots: [{ name: 'master' }, { name: 'detail' }], content: { master: [] },
    metadata: { category: 'Lists', license: 'MIT', attribution: { author: 'Cratis' } },
} as unknown as ScreenTemplate;

describe('when copying a blueprint template into an application template', () => {
    const document = JSON.parse(copiedBlueprintDocument(blueprintTemplate, 'a1b2', 'My master detail'));

    it('should hold the template under the new identifier', () => document.screenTemplates[0].name.should.equal('a1b2'));
    it('should show the name the author gave', () => document.screenTemplates[0].displayName.should.equal('My master detail'));
    it('should keep what the blueprint wrote', () => {
        document.screenTemplates[0].slots.should.deep.equal(blueprintTemplate.slots);
        document.screenTemplates[0].fitsSlot.should.equal('content');
    });
    it('should keep the metadata, attribution and license included', () => document.screenTemplates[0].metadata.should.deep.equal(blueprintTemplate.metadata));
    it('should sit in the studio screen layout', () => document.layouts.map((layout: { name: string }) => layout.name).should.deep.equal(['StudioScreen']));
    it('should be a document with every collection a document has', () => {
        for (const collection of ['dialogTemplates', 'screens', 'exposures', 'instanceContributions']) document[collection].should.deep.equal([]);
    });
    it('should not change the blueprint template', () => blueprintTemplate.name.should.equal('MasterDetail'));
});

describe('when duplicating an application template', () => {
    const source = JSON.stringify({
        layouts: [{ name: 'StudioScreen', slots: [{ name: 'content' }] }],
        screenTemplates: [{ name: 'AAA', displayName: 'Old', slots: [], content: { x: [1] } }],
        dialogTemplates: [], screens: [], exposures: [{ marker: true }], instanceContributions: [],
    });

    it('should hold the template under the new identifier, whatever case the source named it in', () => {
        const copy = JSON.parse(duplicatedDocument(source, 'aaa', 'BBB', 'Copy')!);
        copy.screenTemplates.map((template: { name: string }) => template.name).should.deep.equal(['BBB']);
        copy.screenTemplates[0].displayName.should.equal('Copy');
        copy.screenTemplates[0].content.should.deep.equal({ x: [1] });
    });

    it('should keep the rest of the document', () => JSON.parse(duplicatedDocument(source, 'AAA', 'BBB', 'Copy')!).exposures.should.deep.equal([{ marker: true }]));
    it('should start empty when the source has no document', () => (duplicatedDocument(undefined, 'AAA', 'BBB', 'Copy') === undefined).should.be.true);
    it('should start empty when the document does not hold the template', () => (duplicatedDocument(source, 'ZZZ', 'BBB', 'Copy') === undefined).should.be.true);
    it('should start empty when the document is not JSON', () => (duplicatedDocument('{nope', 'AAA', 'BBB', 'Copy') === undefined).should.be.true);
});
