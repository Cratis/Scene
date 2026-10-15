// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { PackageKind } from '@cratis/scene.model';
import { TemplateCatalogKind, describeTemplateCatalog, validateTemplateMetadata, verifyBlueprintPackage, verifyTemplateDefinitionOfDone } from '@cratis/scene.engine';
import { defaultBlueprint } from '../defaultBlueprint';
import { asLibrary, blueprintOnDisk } from '../for_blueprint/given/the_blueprint_on_disk';
import { foundationScreenTemplates } from '../foundation/templates';
import { foundationPack, foundationTemplateNames, packageRoot } from './given';

// Spec Part B 6, definition of done per template: metadata validation, a type from the vocabulary, a Foundation / <type> category, a one-sentence
// description, a thumbnail that is in the package, no unplaced or ambiguous slot.
describe('when checking each foundation template is done', () => {
    const entries = describeTemplateCatalog([defaultBlueprint].map(source => ({ ...source })), '4.13.0').filter(entry => foundationTemplateNames.includes(entry.name));

    it('should ship exactly the eight templates of Part B 2.2-2.9', () => foundationTemplateNames.should.deep.equal([
        'WorkspaceScreen', 'DashboardScreen', 'ListScreen', 'BoardScreen', 'MasterDetailScreen', 'RecordPage', 'FormScreen', 'WizardScreen',
    ]));

    it('should declare every one of them in the manifest', () => foundationTemplateNames.filter(name => !defaultBlueprint.manifest.screenTemplates.includes(name)).should.deep.equal([]));

    it('should pass metadata validation', () => foundationScreenTemplates.flatMap(template => validateTemplateMetadata(template.name, template.metadata)).should.deep.equal([]));

    it('should be described as compatible, attributed and licensed', () => {
        entries.length.should.equal(foundationTemplateNames.length);
        entries.filter(entry => !entry.compatible).map(entry => entry.problems).should.deep.equal([]);
    });

    it('should declare a type from the vocabulary and a Foundation category that names it', () => {
        foundationScreenTemplates.filter(template => template.metadata?.category !== `Foundation / ${template.metadata?.type}`).map(template => template.name).should.deep.equal([]);
        foundationScreenTemplates.map(template => template.metadata!.type).sort().should.deep.equal(['Board', 'Dashboard', 'Detail', 'Form', 'List', 'Wizard', 'Workspace', 'Workspace']);
    });

    it('should describe each in one sentence without a trailing instruction', () => {
        foundationScreenTemplates.filter(template => !/^[A-Z].*[.]$/.test(template.description ?? '') || (template.description ?? '').split('. ').length > 1).map(template => template.name).should.deep.equal([]);
    });

    it('should ship a thumbnail for each that is in the package', () => {
        foundationScreenTemplates.filter(template => !template.metadata?.thumbnail || !existsSync(join(packageRoot, template.metadata.thumbnail))).map(template => template.name).should.deep.equal([]);
    });

    it('should leave the whole blueprint done, with no template unplaced or ambiguous', () => {
        verifyBlueprintPackage(blueprintOnDisk(defaultBlueprint), asLibrary()).filter(problem => foundationTemplateNames.some(name => problem.includes(`'${name}'`))).should.deep.equal([]);
    });

    for (const template of foundationScreenTemplates) {
        it(`should hold ${template.name} to the reusable per-template definition of done`, () =>
            verifyTemplateDefinitionOfDone(template, blueprintOnDisk(defaultBlueprint), asLibrary(), { categoryPrefix: 'Foundation / ', pack: foundationPack }).should.deep.equal([]));
    }

    it('should be a Blueprint package whose catalog lists them as screen templates', () => {
        defaultBlueprint.manifest.kind.should.equal(PackageKind.Blueprint);
        entries.every(entry => entry.kind === TemplateCatalogKind.ScreenTemplate).should.equal(true);
    });
});
