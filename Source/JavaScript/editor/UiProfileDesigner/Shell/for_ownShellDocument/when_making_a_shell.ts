// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplateRole, TemplateScope } from '@cratis/scene.model';
import { readTemplateMetadata } from '../../../ScreenTemplates/readTemplateMetadata';
import { NewShellStart, ownShellDocument } from '../ownShellDocument';
import { effectiveShellOf } from '../shellSwitch';
import { contextWith, settings } from '../given/aShellContext';

const id = '5d7e2a9c-0000-4000-8000-000000000001';
const current = effectiveShellOf(settings, contextWith());
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parse = (document: string) => JSON.parse(document) as { screenTemplates: { name: string; displayName: string; slots: { name: string; primary?: boolean }[]; outlets?: unknown; metadata: Record<string, any> }[] };
const primaryOf = (slots: { name: string; primary?: boolean }[]) => slots.filter(slot => slot.primary === true).map(slot => slot.name);

describe('when making a blank shell', () => {
    const template = parse(ownShellDocument(NewShellStart.Blank, current, id, 'Compact shell')).screenTemplates[0];

    it('should know the template by its identifier', () => template.name.should.equal(id));
    it('should show the name the author gave it', () => template.displayName.should.equal('Compact shell'));
    it('should have one slot for the screen', () => template.slots.map(slot => slot.name).should.deep.equal(['content']));
    it('should mark it as the primary slot', () => primaryOf(template.slots).should.deep.equal(['content']));
    it('should not declare outlets for its regions', () => (template.outlets === undefined).should.be.true);
    it('should be the application\'s root', () => {
        template.metadata.role.should.equal(TemplateRole.Root);
        (template.metadata.scopes as string[]).should.deep.equal([TemplateScope.Application]);
    });
});

describe('when making a copy of the shell in place', () => {
    const template = parse(ownShellDocument(NewShellStart.CopyOfCurrent, current, id, 'My shell')).screenTemplates[0];

    it('should have the slots of the shell it is a copy of', () => current.slots.every(name => template.slots.some(slot => slot.name === name)).should.be.true);
    it('should mark its primary slot', () => primaryOf(template.slots).should.deep.equal([current.primarySlot]));
    it('should keep the order of its slots', () => template.slots.slice(0, current.template.slots.length).map(slot => slot.name).should.deep.equal(current.template.slots.map(slot => slot.name)));
    it('should not share what it copied with the shell in place', () => {
        (current.template.slots as { name: string }[])[0].name.should.equal(template.slots[0].name);
        (template.slots[0] === current.template.slots[0]).should.be.false;
    });
});

describe('when what was made is read back as an application template', () => {
    const document = ownShellDocument(NewShellStart.CopyOfCurrent, current, id, 'My shell');
    const read = readTemplateMetadata(document, id);

    it('should say it is a root', () => read.role!.should.equal(TemplateRole.Root));
    it('should say where the screen goes', () => read.primarySlot!.should.equal(current.primarySlot));
    it('should list its slots', () => current.slots.every(name => read.slots!.includes(name)).should.be.true);
    it('should be for the application only', () => read.scopes!.should.deep.equal([TemplateScope.Application]));
});
