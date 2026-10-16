// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { defaultBlueprint } from '@cratis/scene.blueprint.default';
import { BlueprintSource, TemplateSource, applicableTemplates, verifyTemplateDefinitionOfDone } from '@cratis/scene.engine';
import { PackageKind, SampleDataPack, TemplateScope } from '@cratis/scene.model';
import { appShellLayout } from '@cratis/scene.blueprint.default';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { projectTrackerBlueprint } from '../blueprint';
import { projectTrackerDialogTemplates, projectTrackerScreenDefinitions, projectTrackerScreenTemplates, projectTrackerNavigation, projectTrackerStructure } from '../index';

const root = join(import.meta.dirname, '..');
const filesUnder = (folder: string): string[] => {
    const absolute = join(root, folder);
    return !existsSync(absolute) ? [] : readdirSync(absolute).flatMap(entry => {
        const path = join(absolute, entry);
        return statSync(path).isDirectory() ? filesUnder(relative(root, path)) : [relative(root, path).split('\\').join('/')];
    });
};
const requiredPackage = (name: string, version: string): TemplateSource => ({
    manifest: { name, version, kind: PackageKind.ComponentLibrary, dependencies: [], components: [], layouts: [], screenTemplates: [], dialogTemplates: [], themes: [] },
});

const packs = projectTrackerBlueprint.manifest.sampleData!.map(reference => JSON.parse(readFileSync(join(root, reference.path), 'utf-8')) as SampleDataPack);
const source = { ...projectTrackerBlueprint, packs, files: [...filesUnder('thumbnails'), ...filesUnder('sampleData')] } as BlueprintSource;
const library = [requiredPackage('PrimeReact', '11.1.0'), requiredPackage('Cratis.Components', '3.0.0'), defaultBlueprint as TemplateSource];
const everyTemplate = [...projectTrackerScreenTemplates, ...projectTrackerDialogTemplates];

const queriesOf = (value: unknown): string[] => {
    if (Array.isArray(value)) return value.flatMap(queriesOf);
    if (value === null || typeof value !== 'object') return [];
    const record = value as Record<string, unknown>;
    return [...(typeof record.query === 'string' && typeof record.path === 'string' ? [record.query] : []), ...Object.values(record).flatMap(queriesOf)];
};

// Spec Part B 6, per template and for the blueprint: metadata, type, category, thumbnail, description, slot placement, no inline rows, and every bound query answered by each sample pack.
describe('when checking each template of the Project and Task Tracker blueprint is done', () => {
    for (const pack of packs) {
        for (const template of everyTemplate) {
            it(`should hold ${template.name} to the definition of done with the ${pack.id} data`, () =>
                verifyTemplateDefinitionOfDone(template, source, library, { categoryPrefix: 'Business / ', pack }).should.deep.equal([]));
        }
    }

    it('should ship 6 screen templates and 3 dialog templates, each declared by the manifest', () => {
        [projectTrackerScreenTemplates.length, projectTrackerDialogTemplates.length].should.deep.equal([6, 3]);
        projectTrackerScreenTemplates.map(template => template.name).should.deep.equal(projectTrackerBlueprint.manifest.screenTemplates);
        projectTrackerDialogTemplates.map(template => template.name).should.deep.equal(projectTrackerBlueprint.manifest.dialogTemplates);
    });

    it('should not collide with a template, layout or component of the blueprints it sits beside', () => {
        const taken = new Set([
            ...(defaultBlueprint.screenTemplates ?? []).map(template => template.name), ...(defaultBlueprint.dialogTemplates ?? []).map(template => template.name),
            ...(defaultBlueprint.layouts ?? []).map(layout => layout.name), ...defaultBlueprint.manifest.components,
        ]);
        everyTemplate.map(template => template.name).filter(name => taken.has(name)).should.deep.equal([]);
        new Set(everyTemplate.map(template => template.name)).size.should.equal(everyTemplate.length);
    });

    it('should tag the packs with the locale they are written in and the blueprint that owns them', () => {
        packs.map(pack => [pack.id, pack.locale, pack.owner]).should.deep.equal([['project-tracker-en', 'en-GB', 'blueprint:project-tracker']]);
    });

    it('should answer every query any screen template, dialog template or screen binds to', () => {
        const bound = [...new Set(everyTemplate.flatMap(template => queriesOf(template.content)))].sort();
        const answered = new Set(packs[0].sets.map(set => set.shape));
        bound.filter(query => !answered.has(query)).should.deep.equal([]);
    });

    it('should leave no set of a pack empty but the selections, so every region has something to show', () => {
        packs.flatMap(pack => pack.sets.filter(set => set.rows.length === 0 && !set.shape.endsWith('Selection')).map(set => `${pack.id}:${set.shape}`)).should.deep.equal([]);
    });
});

// The screen set is one list the manifest, the screens, the structure and the navigation are all derived from; these hold the derived things to it.
describe('when checking the Project and Task Tracker screen set agrees with itself', () => {
    const features = (nodes: { id: string; features?: unknown[] }[], prefix: string): string[] =>
        nodes.flatMap(node => [`${prefix}.${node.id}`, ...features((node.features ?? []) as { id: string; features?: unknown[] }[], `${prefix}.${node.id}`)]);
    const itemsOf = (items: { target?: { module?: string; feature?: string }; children?: unknown[] }[]): { module?: string; feature?: string }[] =>
        items.flatMap(item => [...(item.target ? [item.target] : []), ...itemsOf((item.children ?? []) as never)]);

    it('should provide a Screen for each entry of the screen set, each filling the template it names', () => {
        projectTrackerBlueprint.screens!.map(screen => [screen.name, screen.screenTemplate]).should.deep.equal(projectTrackerScreenDefinitions.map(definition => [definition.name, definition.template]));
    });

    it('should name only templates the blueprint provides', () => {
        const provided = new Set(projectTrackerScreenTemplates.map(template => template.name));
        projectTrackerScreenDefinitions.filter(definition => !provided.has(definition.template)).should.deep.equal([]);
    });

    it('should put every screen in the structure under the module it belongs to', () => {
        const module = projectTrackerStructure.modules[0];
        features(module.features, module.id).sort().should.deep.equal(projectTrackerScreenDefinitions.map(definition => definition.name).sort());
    });

    it('should lead every navigation item to a screen of the set', () => {
        const screens = new Set(projectTrackerScreenDefinitions.map(definition => definition.name));
        const targets = [...projectTrackerNavigation.application.regions, ...projectTrackerNavigation.modules.flatMap(module => module.regions)].flatMap(region => itemsOf(region.items));
        targets.length.should.be.greaterThan(0);
        targets.filter(target => !screens.has(`${target.module}.${target.feature ?? ''}`) && target.feature !== undefined).should.deep.equal([]);
    });

    it('should open only dialogs and screens the blueprint provides', () => {
        const names = new Set([...projectTrackerScreenDefinitions.map(definition => definition.name), ...projectTrackerDialogTemplates.map(template => template.name)]);
        const referenced = everyTemplate.flatMap(template => JSON.stringify(template.content ?? {}).match(/"(?:dialogTemplate|screen)":"([^"]+)"/g) ?? []).map(match => match.split('"')[3]);
        referenced.length.should.be.greaterThan(0);
        referenced.filter(name => !names.has(name)).should.deep.equal([]);
    });
});

// Spec 4.2: a template is shown only at the levels it applies to, and a blueprint with nothing that applies is hidden rather than shown disabled.
describe('when asking which Project and Task Tracker templates apply to a target', () => {
    const library = { blueprints: [source] };
    const namesAt = (scope: TemplateScope, container?: typeof appShellLayout) =>
        applicableTemplates(library, { scope, container }).blueprints.flatMap(blueprint => blueprint.categories.flatMap(group => group.templates.map(template => template.name)));

    it('should offer the lists, board, dashboard and pages of a module in the shell\'s content slot', () => {
        namesAt(TemplateScope.Module, appShellLayout).should.include.members(['ProjectList', 'ProjectTaskBoard', 'ProjectMyTasks']);
        namesAt(TemplateScope.Module, appShellLayout).should.not.include.members(['ProjectPage', 'ProjectQuickCreateTask', 'ProjectTaskSheet']);
    });

    it('should offer the record pages and forms of a feature', () => {
        namesAt(TemplateScope.Feature, appShellLayout).should.include.members(['ProjectPage', 'ProjectList', 'ProjectTaskBoard']);
    });

    it('should offer the quick-create dialogs of a slice and nothing else', () => {
        applicableTemplates(library, { scope: TemplateScope.Slice, container: appShellLayout }).blueprints.flatMap(blueprint => blueprint.categories.flatMap(group => group.templates.map(template => template.name)))
            .sort().should.deep.equal(projectTrackerDialogTemplates.map(template => template.name).sort());
    });

    it('should hide the blueprint where nothing of it applies, rather than show it empty', () => {
        applicableTemplates(library, { scope: TemplateScope.Application }).blueprints.should.deep.equal([]);
    });

    it('should group what it offers under the one category of the blueprint', () => {
        const groups = applicableTemplates(library, { scope: TemplateScope.Feature, container: appShellLayout }).blueprints[0].categories.map(group => group.category);
        groups.should.deep.equal(['Business / Project tracker']);
    });
});
