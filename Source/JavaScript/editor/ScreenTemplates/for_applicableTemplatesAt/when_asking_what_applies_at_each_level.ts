// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SliceKind, TemplateScope } from '@cratis/scene.model';
import type { ApplicableTemplateSet } from '@cratis/scene.engine';
import { TemplateLevel } from '../TemplateLevel';
import { TemplateReferenceKind } from '../TemplateReferenceKind';
import { applicableTemplatesAt, isTemplateApplicable } from '../applicableTemplatesAt';
import { aTemplateCatalog } from '../given/aTemplateCatalog';
import { findTemplateCandidate } from '../findTemplateCandidate';

const own = [
    { id: '00000000-0000-4000-8000-000000000001', name: 'Sales hub', category: 'Workspace', scopes: [TemplateScope.Module] },
    { id: '00000000-0000-4000-8000-000000000002', name: 'Confirm', category: 'Dialog', scopes: [TemplateScope.Slice], sliceKinds: [SliceKind.StateChange] },
    { id: '00000000-0000-4000-8000-000000000003', name: 'Older template' },
];
const catalog = aTemplateCatalog(own);
const blueprint = (id: string) => ({ kind: TemplateReferenceKind.Blueprint, id });
const application = (id: string) => ({ kind: TemplateReferenceKind.Application, id });
const namesOf = (set: ApplicableTemplateSet) => [
    ...set.own.flatMap(group => group.templates.map(template => template.displayName ?? template.name)),
    ...set.blueprints.flatMap(entry => entry.categories.flatMap(group => group.templates.map(template => template.displayName ?? template.name))),
];
const at = (level: TemplateLevel, sliceKind?: SliceKind, chain: ReturnType<typeof blueprint>[] = [], blueprintAbove?: string) =>
    applicableTemplatesAt({ level, sliceKind, chain, reference: undefined, blueprintAbove: blueprintAbove ? findTemplateCandidate(catalog, blueprint(blueprintAbove)) : undefined }, catalog);

describe('when asking what applies at each level', () => {
    it('should offer a module the templates that fit the shell\'s slot, and own templates made for modules', () => {
        const names = namesOf(at(TemplateLevel.Module));
        names.should.include.members(['Sales hub', 'Module workspace']);
        names.should.not.include('Confirm');
    });

    it('should offer a template made before scopes were recorded wherever a screen sits', () => {
        for (const level of [TemplateLevel.Module, TemplateLevel.Feature, TemplateLevel.SubFeature, TemplateLevel.Slice]) namesOf(at(level, SliceKind.StateView)).should.include('Older template');
    });

    it('should offer the application default what a module may use', () => {
        namesOf(at(TemplateLevel.Application)).should.deep.equal(namesOf(at(TemplateLevel.Module)));
    });

    it('should offer a state change slice dialogs, and a dialog made for state changes', () => {
        const names = namesOf(at(TemplateLevel.Slice, SliceKind.StateChange));
        names.should.include.members(['Confirm', 'Form dialog']);
        names.should.not.include('Sales hub');
    });

    it('should not offer a dialog to a slice that only shows state', () => {
        const names = namesOf(at(TemplateLevel.Slice, SliceKind.StateView));
        names.should.not.include('Confirm');
        names.should.not.include('Form dialog');
    });

    it('should offer an automation nothing, since it has no presentation', () => {
        namesOf(at(TemplateLevel.Slice, SliceKind.Automation)).should.be.empty;
    });

    it('should not offer a template again inside the template that contains it', () => {
        namesOf(at(TemplateLevel.Feature, undefined, [blueprint('ModuleWorkspace'), blueprint('FeatureSection')], 'FeatureSection')).should.not.include('FeatureSection');
    });

    it('should leave out a blueprint with nothing that applies rather than listing it empty', () => {
        at(TemplateLevel.Slice, SliceKind.Automation).blueprints.should.be.empty;
    });
});

describe('when asking whether a chosen template applies', () => {
    const set = at(TemplateLevel.Module);

    it('should say a template that is offered applies', () => isTemplateApplicable(set, blueprint('ModuleWorkspace')).should.be.true);
    it('should say an own template that is offered applies', () => isTemplateApplicable(set, application(own[0].id)).should.be.true);
    it('should say a template made for another level does not', () => isTemplateApplicable(set, application(own[1].id)).should.be.false);
    it('should say a template nothing provides does not', () => isTemplateApplicable(set, blueprint('Retired')).should.be.false);
    it('should ignore the case of the identifier', () => isTemplateApplicable(set, blueprint('moduleworkspace')).should.be.true);
});
