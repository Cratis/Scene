// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { validateTemplateMetadata, verifyBlueprintPackage, verifyTemplateDefinitionOfDone } from '@cratis/scene.engine';
import { defaultBlueprint } from '../defaultBlueprint';
import { asLibrary, blueprintOnDisk } from '../for_blueprint/given/the_blueprint_on_disk';
import { laterScreenTemplates } from '../foundation/templates';
import { foundationPack, packageRoot, queriesOf } from '../for_foundationTemplates/given';

// Part B 2.12, later additions: each is held to the same definition of done as the first eight foundation templates (Part B 6).
describe('when checking each later foundation template is done', () => {
    it('should list the later additions in order', () => laterScreenTemplates.map(template => template.name).should.deep.equal(['CalendarScreen', 'TimelineScreen', 'InboxScreen']));

    it('should declare every one of them in the manifest', () => laterScreenTemplates.filter(template => !defaultBlueprint.manifest.screenTemplates.includes(template.name)).should.deep.equal([]));

    it('should pass metadata validation and carry a Foundation category that names the type', () => {
        laterScreenTemplates.flatMap(template => validateTemplateMetadata(template.name, template.metadata)).should.deep.equal([]);
        laterScreenTemplates.filter(template => template.metadata?.category !== `Foundation / ${template.metadata?.type}`).map(template => template.name).should.deep.equal([]);
    });

    it('should ship a thumbnail for each that is in the package', () => {
        laterScreenTemplates.filter(template => !template.metadata?.thumbnail || !existsSync(join(packageRoot, template.metadata.thumbnail))).map(template => template.name).should.deep.equal([]);
    });

    it('should name only queries the foundation pack answers and carry no rows of its own', () => {
        const answered = new Set(foundationPack.sets.map(set => set.shape));
        laterScreenTemplates.flatMap(template => queriesOf(template).filter(query => !answered.has(query)).map(query => `${template.name}:${query}`)).should.deep.equal([]);
        laterScreenTemplates.flatMap(template => JSON.stringify(template.content).match(/"(rows|cards|entries|items|events)":\[\{/g) ?? []).should.deep.equal([]);
    });

    it('should leave the whole blueprint done, with no template unplaced or ambiguous', () => {
        verifyBlueprintPackage(blueprintOnDisk(defaultBlueprint), asLibrary()).filter(problem => laterScreenTemplates.some(template => problem.includes(`'${template.name}'`))).should.deep.equal([]);
    });

    for (const template of laterScreenTemplates) {
        it(`should hold ${template.name} to the reusable per-template definition of done`, () =>
            verifyTemplateDefinitionOfDone(template, blueprintOnDisk(defaultBlueprint), asLibrary(), { categoryPrefix: 'Foundation / ', pack: foundationPack }).should.deep.equal([]));
    }
});
