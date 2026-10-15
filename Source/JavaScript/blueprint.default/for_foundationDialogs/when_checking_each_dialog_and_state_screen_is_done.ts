// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { TemplateCatalogKind, describeTemplateCatalog, verifyBlueprintPackage, verifyTemplateDefinitionOfDone } from '@cratis/scene.engine';
import { defaultBlueprint } from '../defaultBlueprint';
import { asLibrary, blueprintOnDisk } from '../for_blueprint/given/the_blueprint_on_disk';
import { foundationTemplateAliases, stateScreenTemplates } from '../foundation/templates';
import { galleryDialogTemplates, galleryScreenTemplates } from '../gallery';
import { addedDialogNames, dialogNames, foundationPack, packageRoot, specDialogNames, stateScreenNames } from './given';

const source = blueprintOnDisk(defaultBlueprint);
const library = asLibrary();

// Spec Part B 2.10 and 2.11, held to the definition of done of Part B 6: the five dialogs and the four auth and state screens, each with complete metadata, a type from the
// vocabulary, a Foundation category, a one-sentence description, a thumbnail in the package, every slot placed, and its preview data in the sample-data pack.
describe('when checking each dialog and state screen is done', () => {
    it('should ship the five dialog templates of Part B 2.10', () => dialogNames.should.include.members(specDialogNames));

    it('should ship the four auth and state screens of Part B 2.11', () => stateScreenNames.should.deep.equal(['LoginScreen', 'NotFoundScreen', 'ForbiddenScreen', 'ErrorScreen']));

    it('should declare every one of them in the manifest', () => {
        specDialogNames.filter(name => !defaultBlueprint.manifest.dialogTemplates.includes(name)).should.deep.equal([]);
        stateScreenNames.filter(name => !defaultBlueprint.manifest.screenTemplates.includes(name)).should.deep.equal([]);
    });

    for (const template of galleryDialogTemplates) {
        it(`should hold the dialog ${template.name} to the reusable per-template definition of done`, () =>
            verifyTemplateDefinitionOfDone(template, source, library, { categoryPrefix: 'Foundation / ', pack: foundationPack }).should.deep.equal([]));

        it(`should categorise the dialog ${template.name} as a Foundation / Dialog with a thumbnail in the package`, () => {
            [template.metadata?.type, template.metadata?.category].should.deep.equal(['Dialog', 'Foundation / Dialog']);
            existsSync(join(packageRoot, template.metadata!.thumbnail!)).should.equal(true);
        });
    }

    for (const template of stateScreenTemplates) {
        it(`should hold the screen ${template.name} to the reusable per-template definition of done`, () =>
            verifyTemplateDefinitionOfDone(template, source, library, { categoryPrefix: 'Foundation / ', pack: foundationPack }).should.deep.equal([]));
    }

    it('should categorise the login screen as Auth and the other three as State', () =>
        stateScreenTemplates.map(template => `${template.name}:${template.metadata?.type}:${template.metadata?.category}`).should.deep.equal([
            'LoginScreen:Auth:Foundation / Auth', 'NotFoundScreen:State:Foundation / State', 'ForbiddenScreen:State:Foundation / State', 'ErrorScreen:State:Foundation / State',
        ]));

    it('should describe them in the catalog as compatible, attributed and licensed', () => {
        const entries = describeTemplateCatalog([defaultBlueprint, ...library], '4.13.0').filter(entry => [...dialogNames, ...stateScreenNames].includes(entry.name));
        entries.length.should.equal(dialogNames.length + stateScreenNames.length);
        entries.filter(entry => !entry.compatible).map(entry => [entry.name, entry.problems]).should.deep.equal([]);
        entries.filter(entry => entry.kind === TemplateCatalogKind.DialogTemplate).length.should.equal(dialogNames.length);
    });

    it('should leave the whole blueprint done, with no template unplaced, ambiguous or without a thumbnail it names', () => {
        verifyBlueprintPackage(source, library).filter(problem => [...dialogNames, ...stateScreenNames].some(name => problem.includes(`'${name}'`))).should.deep.equal([]);
    });

    describe('and naming the earlier templates the new ones stand beside', () => {
        const allNames = [...galleryScreenTemplates, ...galleryDialogTemplates].map(template => template.name);

        it('should keep every earlier name: nothing was renamed or removed', () =>
            ['Login', 'NotFound', 'AccessDenied', 'Error', 'ConfirmDialog', 'FormDialog', 'DetailDialog'].filter(name => !allNames.includes(name)).should.deep.equal([]));

        it('should map each spec-named template to the earlier one it is the alias of, and both exist', () => {
            Object.entries(foundationTemplateAliases).filter(([spec, earlier]) => !allNames.includes(spec) || !allNames.includes(earlier)).should.deep.equal([]);
            foundationTemplateAliases.ForbiddenScreen.should.equal('AccessDenied');
            foundationTemplateAliases.QuickCreateDialog.should.equal('FormDialog');
        });

        it('should have no two templates of this package with the same name', () => allNames.filter((name, index) => allNames.indexOf(name) !== index).should.deep.equal([]));

        it('should add only names that are not taken by a component library the blueprint is used with', () => {
            // PrimeReact and Cratis.Components name components, never screen or dialog templates; the only template name two packages share is the earlier ConfirmDialog.
            addedDialogNames.filter(name => ['ConfirmDialog'].includes(name)).should.deep.equal([]);
        });
    });
});
