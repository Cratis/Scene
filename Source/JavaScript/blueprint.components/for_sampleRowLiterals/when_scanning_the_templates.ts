// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { findTemplateSampleRowLiterals } from '@cratis/scene.engine';
import { componentsDialogTemplates, componentsScreenTemplates } from '../templates';

// Spec §11 SD1: demo rows belong to sample-data packs, not to templates. These are the seeds that exist today:
// the time machine's invoice versions (the shape `blueprint.components/templates/sampleData.ts` declares) and the
// filter options, which are configuration rather than rows. They migrate to packs with the blueprint library issues;
// until then this list is the allow-list, and a new row literal anywhere else fails here.
const allowed = [
    'DataListWithDetailPage: versions',
    'MasterDetailPage: versions',
    'ObjectEditorPage: filters',
    'ObjectEditorPage: filters[0].options',
    'ObjectEditorPage: versions',
    'DataModulePage: filters',
    'DataModulePage: filters[0].options',
];

describe('when scanning the templates for sample row literals', () => {
    const found = [...componentsScreenTemplates, ...componentsDialogTemplates].flatMap(template =>
        findTemplateSampleRowLiterals(template.content).map(location => `${template.name}: ${location.slice(location.indexOf('.') + 1)}`));

    it('should find only the allow-listed seeds', () => found.should.have.members(allowed));
});
