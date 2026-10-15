// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplateScope, SliceKind } from '@cratis/scene.model';
import { applicableTemplates } from '@cratis/scene.engine';
import { defaultBlueprint } from '../defaultBlueprint';

const library = { blueprints: [defaultBlueprint] };
const shell = defaultBlueprint.layouts![0];
const names = (categories: { templates: { name: string }[] }[]) => categories.flatMap(group => group.templates.map(template => template.name));

describe('when choosing its templates for each level', () => {
    it('should offer both layouts at application level', () => {
        const [blueprint] = applicableTemplates(library, { scope: TemplateScope.Application }).blueprints;
        blueprint.blueprint.should.equal(defaultBlueprint.manifest.name);
        blueprint.categories.map(group => group.category).should.deep.equal(['Foundation / Shell']);
        names(blueprint.categories).should.have.members(defaultBlueprint.manifest.layouts);
    });

    it('should offer screen templates that fit the shell content slot at module level', () => {
        const [blueprint] = applicableTemplates(library, { scope: TemplateScope.Module, container: shell }).blueprints;
        names(blueprint.categories).should.include.members(['Dashboard', 'CrudList', 'Login', 'ModuleWorkspace']);
        names(blueprint.categories).should.not.include.members(['ConfirmDialog']);
    });

    it('should offer only dialogs on a state change slice', () => {
        const [blueprint] = applicableTemplates(library, { scope: TemplateScope.Slice, sliceKind: SliceKind.StateChange }).blueprints;
        blueprint.categories.map(group => group.category).should.deep.equal(['Foundation / Dialog']);
    });

    it('should hide the blueprint on a state view slice, where it ships no fragment', () => {
        applicableTemplates(library, { scope: TemplateScope.Slice, sliceKind: SliceKind.StateView }).blueprints.should.deep.equal([]);
    });
});
