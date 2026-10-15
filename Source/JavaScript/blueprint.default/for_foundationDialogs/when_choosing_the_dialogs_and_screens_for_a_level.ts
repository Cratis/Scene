// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SliceKind, TemplateReferenceSource, TemplateScope } from '@cratis/scene.model';
import { TemplateReferenceStatus, applicableTemplates, resolveTemplateReference } from '@cratis/scene.engine';
import { defaultBlueprint } from '../defaultBlueprint';
import { fullPageLayout } from '../layouts';
import { dialogNames, stateScreenNames } from './given';

const library = { blueprints: [defaultBlueprint] };

// The components blueprint ships a ConfirmDialog of its own (a command confirmation); this stands in for any such second blueprint, which this package cannot import.
const otherBlueprint = {
    manifest: { ...defaultBlueprint.manifest, name: 'Cratis.Blueprint.Components', layouts: [], screenTemplates: [], dialogTemplates: ['ConfirmDialog'], components: [], themes: [], dependencies: [] },
    dialogTemplates: [{ name: 'ConfirmDialog', slots: [{ name: 'body' }] }],
};
const names = (categories: { templates: { name: string }[] }[]) => categories.flatMap(group => group.templates.map(template => template.name));

// Acceptance: five dialog templates and four auth/state screens available, categorised, applicable at the right levels. A dialog is what a state change slice
// summons; the screens fit the full-page layout's content, so they are offered where a screen is chosen for that layout.
describe('when choosing the dialogs and screens for a level', () => {
    it('should offer every dialog on a state change slice, under the Foundation / Dialog category and nothing else', () => {
        const [blueprint] = applicableTemplates(library, { scope: TemplateScope.Slice, sliceKind: SliceKind.StateChange }).blueprints;
        blueprint.categories.map(group => group.category).should.deep.equal(['Foundation / Dialog']);
        names(blueprint.categories).should.have.members(dialogNames);
    });

    it('should offer the dialogs on no other kind of slice', () => {
        applicableTemplates(library, { scope: TemplateScope.Slice, sliceKind: SliceKind.StateView }).blueprints.should.deep.equal([]);
    });

    it('should not offer a dialog where a screen is chosen', () => {
        const [blueprint] = applicableTemplates(library, { scope: TemplateScope.Module, container: fullPageLayout }).blueprints;
        names(blueprint.categories).should.not.include.members(dialogNames);
    });

    it('should offer the four auth and state screens where a screen is chosen for the full-page layout, categorised Auth and State', () => {
        const [blueprint] = applicableTemplates(library, { scope: TemplateScope.Module, container: fullPageLayout }).blueprints;
        names(blueprint.categories).should.include.members(stateScreenNames);
        blueprint.categories.filter(group => group.templates.some(template => stateScreenNames.includes(template.name))).map(group => group.category).sort().should.deep.equal(['Foundation / Auth', 'Foundation / State']);
    });

    it('should keep the ConfirmDialog of this blueprint and the one of the components blueprint apart, because a reference names its blueprint', () => {
        const both = { blueprints: [defaultBlueprint, otherBlueprint] };
        const resolve = (blueprint: string) => resolveTemplateReference({ source: TemplateReferenceSource.Blueprint, blueprint, id: 'ConfirmDialog' }, both);
        const foundation = resolve(defaultBlueprint.manifest.name);
        const business = resolve(otherBlueprint.manifest.name);
        [foundation.status, business.status].should.deep.equal([TemplateReferenceStatus.Resolved, TemplateReferenceStatus.Resolved]);
        [foundation.package, business.package].should.deep.equal([defaultBlueprint.manifest.name, otherBlueprint.manifest.name]);
    });
});
