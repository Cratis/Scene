// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SliceKind, TemplateScope } from '@cratis/scene.model';
import { CascadeEntry, CascadeEntryKind } from '../../CascadeMenu';
import { TemplateLevel } from '../../ScreenTemplates/TemplateLevel';
import { TemplateReferenceKind } from '../../ScreenTemplates/TemplateReferenceKind';
import { applicableTemplatesAt } from '../../ScreenTemplates/applicableTemplatesAt';
import { aTemplateCatalog } from '../../ScreenTemplates/given/aTemplateCatalog';
import { describeTemplatePicker } from '../describeTemplatePicker';
import { someTemplatePickerLabels } from './given/someTemplatePickerLabels';

const own = [
    { id: '00000000-0000-4000-8000-000000000001', name: 'Sales hub', category: 'Workspace', scopes: [TemplateScope.Module] },
    { id: '00000000-0000-4000-8000-000000000002', name: 'Quarter board', category: 'Dashboard', scopes: [TemplateScope.Module] },
    { id: '00000000-0000-4000-8000-000000000003', name: 'Anything', scopes: [TemplateScope.Module] },
];
const catalog = aTemplateCatalog(own);
const at = (level: TemplateLevel, sliceKind?: SliceKind) => applicableTemplatesAt({ level, sliceKind, chain: [], reference: undefined }, catalog);
const labels = someTemplatePickerLabels();
const none = { onChoose: () => undefined };
const labelsOf = (entries: CascadeEntry[]) => entries.map(entry => `${entry.kind}:${entry.label}`);
const submenu = (entries: CascadeEntry[], id: string) => entries.find(entry => entry.kind === CascadeEntryKind.Submenu && entry.id === id) as Extract<CascadeEntry, { kind: CascadeEntryKind.Submenu }>;

describe('when describing the template picker for a module', () => {
    const current = { kind: TemplateReferenceKind.Application, id: own[0].id };
    const entries = describeTemplatePicker(at(TemplateLevel.Module), current, '', labels, { ...none, onNewFromCurrent: () => undefined, onClear: () => undefined });

    it('should list the user\'s own templates first, under their category headings', () => {
        labelsOf(entries).slice(0, 7).should.deep.equal([
            'heading:My templates', 'subheading:Workspace', 'item:Sales hub', 'subheading:Dashboard', 'item:Quarter board', 'subheading:Other', 'item:Anything']);
    });

    it('should check the template in effect', () => {
        const checked = entries.filter(entry => entry.kind === CascadeEntryKind.Item && entry.checked).map(entry => entry.label);
        checked.should.deep.equal(['Sales hub']);
    });

    it('should put the blueprints one level deeper, never among the user\'s own templates', () => {
        entries.filter(entry => entry.kind === CascadeEntryKind.Item && entry.id.startsWith('blueprint')).should.be.empty;
        submenu(entries, 'blueprints').label.should.equal('Blueprints');
    });

    it('should name each blueprint category as blueprint, then category', () => {
        const blueprint = submenu(submenu(entries, 'blueprints').entries, 'blueprint:Cratis.Blueprint.Default');
        const headings = blueprint.entries.filter(entry => entry.kind === CascadeEntryKind.Heading).map(entry => entry.label);
        headings.every(heading => heading.includes(' · ')).should.be.true;
        headings.should.include.members(headings.filter(heading => heading.endsWith('Workspace')));
    });

    it('should end with the footer actions', () => {
        labelsOf(entries).slice(-3).should.deep.equal(['separator:', 'item:+ New template from current…', 'item:Clear template']);
    });
});

describe('when describing the template picker for a slice that changes state', () => {
    const entries = describeTemplatePicker(at(TemplateLevel.Slice, SliceKind.StateChange), undefined, '', labels, none);
    const headings = (submenu(submenu(entries, 'blueprints').entries, 'blueprint:Cratis.Blueprint.Default')).entries
        .filter(entry => entry.kind === CascadeEntryKind.Heading).map(entry => entry.label);

    it('should list only dialog templates from the blueprints', () => {
        headings.length.should.be.greaterThan(0);
        headings.every(heading => /Dialog$/.test(heading)).should.be.true;
    });

    it('should not list the user\'s templates made for modules', () => {
        labelsOf(entries).should.not.include('item:Sales hub');
    });
});

describe('when filtering the template picker', () => {
    it('should narrow the user\'s own templates and drop a blueprint with no match', () => {
        const entries = describeTemplatePicker(at(TemplateLevel.Module), undefined, 'quarter', labels, none);
        labelsOf(entries).should.deep.equal(['heading:My templates', 'subheading:Dashboard', 'item:Quarter board']);
    });

    it('should match a blueprint template by its category and list only the matching templates', () => {
        const entries = describeTemplatePicker(at(TemplateLevel.Module), undefined, 'foundation / dash', labels, none);
        const blueprint = submenu(submenu(entries, 'blueprints').entries, 'blueprint:Cratis.Blueprint.Default');
        labelsOf(blueprint.entries)[0].should.equal('heading:Cratis Default Blueprint · Foundation / Dashboard');
        labelsOf(blueprint.entries).slice(1).should.not.be.empty;
        labelsOf(blueprint.entries).slice(1).every(label => label === 'item:Dashboard').should.be.true;
    });

    it('should leave out the blueprints altogether when none of their templates match', () => {
        labelsOf(describeTemplatePicker(at(TemplateLevel.Module), undefined, 'quarter', labels, none)).should.not.include('submenu:Blueprints');
    });

    it('should say so when nothing matches', () => {
        labelsOf(describeTemplatePicker(at(TemplateLevel.Module), undefined, 'zzzzzz', labels, none)).should.deep.equal(['note:Nothing applies here']);
    });
});

describe('when copying a blueprint template into the user\'s own', () => {
    let copied = '';
    const entries = describeTemplatePicker(at(TemplateLevel.Module), undefined, '', labels, { ...none, onCopyToMine: template => { copied = template.name; } });
    const first = submenu(submenu(entries, 'blueprints').entries, 'blueprint:Cratis.Blueprint.Default').entries.find(entry => entry.kind === CascadeEntryKind.Item)!;
    if (first.kind === CascadeEntryKind.Item) first.actions![0].onActivate();

    it('should offer the action on blueprint templates only', () => {
        const ownItem = entries.find(entry => entry.kind === CascadeEntryKind.Item && entry.id.startsWith('own:')) as Extract<CascadeEntry, { kind: CascadeEntryKind.Item }>;
        ownItem.actions!.should.be.empty;
        (first as Extract<CascadeEntry, { kind: CascadeEntryKind.Item }>).actions![0].label.should.equal('Copy to my templates');
    });

    it('should copy the template that was chosen', () => copied.length.should.be.greaterThan(0));
});

describe('when the host has a template browser', () => {
    const browsed: string[] = [];
    const withBrowser = { ...none, onBrowseAll: () => { browsed.push('browsed'); } };
    const footerOf = (entries: ReturnType<typeof describeTemplatePicker>) => entries.slice(entries.findIndex(entry => entry.id === 'footer-separator') + 1);

    it('should put "Browse all…" first in the footer', () => {
        const footer = footerOf(describeTemplatePicker(at(TemplateLevel.Module), undefined, '', labels, withBrowser));
        footer[0].id.should.equal('browse-all');
        footer[0].label.should.equal(labels.browseAll);
    });

    it('should open the browser when the row is chosen', () => {
        const footer = footerOf(describeTemplatePicker(at(TemplateLevel.Module), undefined, '', labels, withBrowser));
        (footer[0] as { onActivate: () => void }).onActivate();
        browsed.should.deep.equal(['browsed']);
    });

    it('should offer "Browse all…" even when nothing applies, because that is how a blueprint gets here', () => {
        const entries = describeTemplatePicker({ ...at(TemplateLevel.Module), own: [], blueprints: [] }, undefined, '', labels, withBrowser);
        entries.some(entry => entry.id === 'nothing-applies').should.be.true;
        footerOf(entries)[0].id.should.equal('browse-all');
    });

    it('should not put a gallery row in the blueprints panel any more', () => {
        const panel = submenu(describeTemplatePicker(at(TemplateLevel.Module), undefined, '', labels, withBrowser), 'blueprints').entries;
        panel.some(entry => entry.id === 'browse-gallery').should.be.false;
    });

    it('should not offer a blueprints panel when no blueprint applies', () => {
        describeTemplatePicker({ ...at(TemplateLevel.Module), blueprints: [] }, undefined, '', labels, withBrowser).some(entry => entry.id === 'blueprints').should.be.false;
    });

    it('should not offer the row when the host has no browser', () => {
        describeTemplatePicker(at(TemplateLevel.Module), undefined, '', labels, none).some(entry => entry.id === 'browse-all').should.be.false;
    });
});
