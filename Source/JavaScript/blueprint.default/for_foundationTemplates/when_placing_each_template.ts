// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplateScope } from '@cratis/scene.model';
import { applicableTemplates, resolveScreenTemplates, validateScreenTemplateForTarget } from '@cratis/scene.engine';
import { defaultBlueprint } from '../defaultBlueprint';
import { appShellLayout } from '../layouts';
import { foundationScreenTemplates } from '../foundation/templates';
import { foundationTemplateNames } from './given';

const workspace = foundationScreenTemplates.find(template => template.name === 'WorkspaceScreen')!;
const masterDetail = foundationScreenTemplates.find(template => template.name === 'MasterDetailScreen')!;
const inContent = foundationScreenTemplates.filter(template => template !== masterDetail);

// Acceptance: all nine templates resolve cleanly through ApplicableTemplates at their intended levels; any template is placeable in `content`
// without per-template shell code; and a qualified slot (Part B 1.3) says which container a template fits.
describe('when placing each foundation template', () => {
    const resolution = resolveScreenTemplates(appShellLayout, foundationScreenTemplates);
    const placement = (name: string) => resolution.placements.find(candidate => candidate.template === name);

    it('should place every template exactly once, with nothing unplaced and nothing nested in itself', () => {
        resolution.unplaced.should.deep.equal([]);
        resolution.cycles.should.deep.equal([]);
        resolution.placements.map(candidate => candidate.template).sort().should.deep.equal([...foundationTemplateNames].sort());
    });

    it('should place each template other than the master/detail in the shell content slot, without any code of its own', () => {
        inContent.map(template => `${template.name}:${placement(template.name)?.container}.${placement(template.name)?.slot}`)
            .should.deep.equal(inContent.map(template => `${template.name}:AppShell.content`));
    });

    it('should place the master/detail in the workspace content slot, by the qualified name and nowhere else', () => {
        masterDetail.fitsSlot!.should.equal('WorkspaceScreen.moduleContent');
        placement('MasterDetailScreen')!.should.deep.include({ container: 'WorkspaceScreen', slot: 'moduleContent', depth: 2 });
    });

    it('should not place the master/detail anywhere else even though another container could declare the same slot name', () => {
        const unqualified = { ...masterDetail, fitsSlot: 'moduleContent' };
        const clash = { ...workspace, name: 'OtherWorkspace' };
        resolveScreenTemplates(appShellLayout, [workspace, clash, unqualified]).unplaced.map(entry => entry.template).should.deep.equal(['MasterDetailScreen']);
        resolveScreenTemplates(appShellLayout, [workspace, clash, masterDetail]).placements.find(candidate => candidate.template === 'MasterDetailScreen')!.container.should.equal('WorkspaceScreen');
    });

    it('should declare every slot named in Part B 2.2-2.9, in the order the spec lists them', () => {
        const slotsOf = (name: string) => foundationScreenTemplates.find(template => template.name === name)!.slots.map(slot => slot.name);
        slotsOf('WorkspaceScreen').should.deep.equal(['moduleNav', 'moduleContent']);
        slotsOf('DashboardScreen').should.deep.equal(['header', 'kpis', 'charts', 'tables', 'aside']);
        slotsOf('ListScreen').should.deep.equal(['header', 'toolbar', 'filters', 'list', 'bulkBar', 'footer']);
        slotsOf('BoardScreen').should.deep.equal(['header', 'toolbar', 'board']);
        slotsOf('MasterDetailScreen').should.deep.equal(['list', 'details']);
        slotsOf('RecordPage').should.deep.equal(['header', 'summary', 'tabs', 'main', 'related', 'activity', 'aside']);
        slotsOf('FormScreen').should.deep.equal(['header', 'body', 'actions']);
        slotsOf('WizardScreen').should.deep.equal(['header', 'progress', 'step', 'actions']);
    });

    it('should fill only slots the template declares', () => {
        foundationScreenTemplates.flatMap(template => Object.keys(template.content ?? {}).filter(slot => !template.slots.some(declared => declared.name === slot)).map(slot => `${template.name}.${slot}`)).should.deep.equal([]);
    });

    describe('and offering them to an author', () => {
        const container = { name: 'AppShell', slots: appShellLayout.slots };
        const offered = (scope: TemplateScope) => applicableTemplates({ blueprints: [defaultBlueprint] }, { scope, container })
            .blueprints.flatMap(blueprint => blueprint.categories.flatMap(category => category.templates.map(template => template.name)));

        it('should offer the templates that fit the shell at module, feature and subfeature level, but not for a slice', () => {
            for (const scope of [TemplateScope.Module, TemplateScope.Feature, TemplateScope.Subfeature]) {
                inContent.filter(template => !offered(scope).includes(template.name)).map(template => `${scope}:${template.name}`).should.deep.equal([]);
            }

            foundationTemplateNames.filter(name => offered(TemplateScope.Slice).includes(name)).should.deep.equal([]);
        });

        it('should offer the master/detail inside the workspace and not directly in the shell', () => {
            validateScreenTemplateForTarget(masterDetail, { scope: TemplateScope.Feature, container: { name: 'WorkspaceScreen', slots: workspace.slots } }).should.deep.equal([]);
            validateScreenTemplateForTarget(masterDetail, { scope: TemplateScope.Feature, container }).length.should.be.greaterThan(0);
        });

        it('should group them under their Foundation category', () => {
            const categories = applicableTemplates({ blueprints: [defaultBlueprint] }, { scope: TemplateScope.Module, container }).blueprints.flatMap(blueprint => blueprint.categories.map(category => category.category));
            ['Foundation / Dashboard', 'Foundation / List', 'Foundation / Board', 'Foundation / Form', 'Foundation / Wizard', 'Foundation / Detail', 'Foundation / Workspace'].filter(name => !categories.includes(name)).should.deep.equal([]);
        });
    });
});
