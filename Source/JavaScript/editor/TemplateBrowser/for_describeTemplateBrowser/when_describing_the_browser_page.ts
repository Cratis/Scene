// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplateCatalogKind } from '@cratis/scene.engine';
import { allTemplatesRailId, blueprintRailId, ownTemplatesRailId } from '../TemplateBrowserRailItem';
import { TemplateBrowserEmpty } from '../TemplateBrowserEmpty';
import { TemplateBrowserMode } from '../TemplateBrowserMode';
import { TemplateOrigin } from '../TemplateOrigin';
import { describeTemplateBrowser } from '../describeTemplateBrowser';
import { aBrowserInput, moduleTarget, salesHub } from './given/aBrowserInput';

describe('when describing the browser page without a target', () => {
    const model = describeTemplateBrowser(aBrowserInput());

    it('should list every template, the application\'s own first', () => {
        model.entries[0].origin.should.equal(TemplateOrigin.Own);
        model.entries.filter(entry => entry.origin === TemplateOrigin.Own).map(entry => entry.displayName).should.deep.equal(['Confirm', 'Sales hub']);
        model.entries.some(entry => entry.origin === TemplateOrigin.Blueprint).should.be.true;
    });

    it('should not hold the application\'s own templates to the metadata a shipped template declares', () => {
        const own = model.entries.filter(entry => entry.origin === TemplateOrigin.Own);
        own.every(entry => entry.compatible && entry.problems.length === 0).should.be.true;
    });

    it('should open the rail with every template and the application\'s own', () => {
        model.rail.slice(0, 2).map(item => item.id).should.deep.equal([allTemplatesRailId, ownTemplatesRailId]);
    });

    it('should give every blueprint the build ships a row, in the profile or not', () => {
        const ids = model.rail.map(item => item.id);
        ids.should.include.members([blueprintRailId('Cratis.Blueprint.Crm'), blueprintRailId('Cratis.Blueprint.Approvals'), blueprintRailId('Cratis.Blueprint.Ticketing')]);
    });

    it('should say a blueprint that is not in the profile is not installed, and every one of its templates with it', () => {
        model.rail.find(item => item.id === blueprintRailId('Cratis.Blueprint.Crm'))!.installed.should.be.false;
        const crm = describeTemplateBrowser(aBrowserInput({ railId: blueprintRailId('Cratis.Blueprint.Crm') }));
        crm.entries.length.should.be.greaterThan(0);
        crm.entries.every(entry => !entry.installed).should.be.true;
    });

    it('should say the foundation blueprint is in the profile', () => {
        model.rail.find(item => item.id === blueprintRailId('Cratis.Blueprint.Default'))?.installed.should.be.true;
    });

    it('should count what each row would list', () => {
        model.rail.find(item => item.id === allTemplatesRailId)!.count.should.equal(model.entries.length);
        model.rail.find(item => item.id === ownTemplatesRailId)!.count.should.equal(2);
    });

    it('should not leave anything out and not explain anything away without a target', () => {
        model.hidden.should.equal(0);
        model.entries.every(entry => entry.applicability.applies && entry.applicability.reasons.length === 0).should.be.true;
    });

    it('should give a blueprint template a reference that names the blueprint template', () => {
        const entry = model.entries.find(candidate => candidate.origin === TemplateOrigin.Blueprint && candidate.kind === TemplateCatalogKind.ScreenTemplate)!;
        entry.reference.id.should.equal(entry.name);
    });

    it('should give a blueprint template the package and version it comes from', () => {
        const entry = model.entries.find(candidate => candidate.package === 'Cratis.Blueprint.Crm')!;
        entry.packageVersion!.should.match(/^\d+\.\d+\.\d+/);
    });

    it('should list the categories of the row, to narrow by', () => model.categories.should.include.members(['Workspace', 'Dialog']));
});

describe('when selecting the application\'s own templates', () => {
    const own = describeTemplateBrowser(aBrowserInput({ railId: ownTemplatesRailId }));

    it('should list only them', () => own.entries.every(entry => entry.origin === TemplateOrigin.Own).should.be.true);
    it('should mark them installed, since they are the application\'s', () => own.entries.every(entry => entry.installed).should.be.true);
});

describe('when the application has no templates of its own', () => {
    const own = describeTemplateBrowser(aBrowserInput({ railId: ownTemplatesRailId }, undefined, []));

    it('should say there is nothing here yet', () => own.empty!.should.equal(TemplateBrowserEmpty.NothingYet));
    it('should list nothing', () => own.entries.should.be.empty);
});

describe('when selecting a blueprint that is not in the profile', () => {
    const crm = describeTemplateBrowser(aBrowserInput({ railId: blueprintRailId('Cratis.Blueprint.Crm'), filter: 'zzz-nothing' }));

    it('should still say nothing matches a filter that matches nothing', () => crm.empty!.should.equal(TemplateBrowserEmpty.NothingMatches));
});

describe('when the row asked for is no longer there', () => {
    it('should fall back to every template', () => describeTemplateBrowser(aBrowserInput({ railId: 'blueprint:Gone' })).selectedRailId.should.equal(allTemplatesRailId));
});

describe('when filtering', () => {
    it('should match on the name', () => describeTemplateBrowser(aBrowserInput({ filter: 'sales hub' })).entries.map(entry => entry.displayName).should.include('Sales hub'));
    it('should match on the blueprint\'s name', () => describeTemplateBrowser(aBrowserInput({ filter: 'crm' })).entries.every(entry => entry.package?.includes('Crm')).should.be.true);
    it('should match on the category', () => describeTemplateBrowser(aBrowserInput({ category: 'Workspace' })).entries.every(entry => entry.category === 'Workspace').should.be.true);
    it('should need every word', () => describeTemplateBrowser(aBrowserInput({ filter: 'sales zzzz' })).entries.should.be.empty);
});

describe('when the page is given a target', () => {
    const model = describeTemplateBrowser(aBrowserInput({ mode: TemplateBrowserMode.Manage, target: moduleTarget }));

    it('should keep what does not fit, so the user can see why', () => {
        const confirm = model.entries.find(entry => entry.displayName === 'Confirm')!;
        confirm.applicability.applies.should.be.false;
        confirm.applicability.reasons.length.should.be.greaterThan(0);
        model.hidden.should.equal(0);
    });

    it('should say a template that fits does', () => model.entries.find(entry => entry.name === salesHub.id)!.applicability.applies.should.be.true);
});
