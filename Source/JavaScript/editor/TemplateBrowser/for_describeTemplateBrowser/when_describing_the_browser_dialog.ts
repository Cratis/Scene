// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { applicableTemplates } from '@cratis/scene.engine';
import { TemplateReferenceKind } from '../../ScreenTemplates/TemplateReferenceKind';
import { TemplateBrowserRailKind } from '../TemplateBrowserRailKind';
import { TemplateBrowserMode } from '../TemplateBrowserMode';
import { TemplateOrigin } from '../TemplateOrigin';
import { describeTemplateBrowser } from '../describeTemplateBrowser';
import { aBrowserInput, moduleTarget, salesHub, stateViewSliceTarget } from './given/aBrowserInput';

describe('when describing the browser dialog for a module', () => {
    const input = aBrowserInput({ mode: TemplateBrowserMode.Pick, target: moduleTarget });
    const model = describeTemplateBrowser(input);

    it('should leave out what does not fit, not disable it (spec TPL2)', () => {
        model.entries.map(entry => entry.displayName).should.not.include('Confirm');
        model.entries.every(entry => entry.applicability.applies).should.be.true;
    });

    it('should say how many it left out', () => model.hidden.should.be.greaterThan(0));

    it('should list exactly what Scene says applies - Studio adds no rule of its own (spec TPL5)', () => {
        const set = applicableTemplates({ own: input.own, blueprints: input.blueprints }, moduleTarget);
        const expected = [...set.own.flatMap(group => group.templates), ...set.blueprints.flatMap(blueprint => blueprint.categories.flatMap(group => group.templates))].length;
        model.entries.length.should.equal(expected);
    });

    it('should keep the template that fits', () => model.entries.map(entry => entry.reference.id).should.include(salesHub.id));

    it('should not give a row to a blueprint with nothing that fits', () => {
        const slice = describeTemplateBrowser(aBrowserInput({ mode: TemplateBrowserMode.Pick, target: stateViewSliceTarget }));
        const withTemplates = new Set(slice.entries.map(entry => entry.package));
        slice.rail.filter(item => item.kind === TemplateBrowserRailKind.Blueprint).every(item => withTemplates.has(item.id.replace('blueprint:', ''))).should.be.true;
    });
});

describe('when the template in effect is among them', () => {
    const model = describeTemplateBrowser(aBrowserInput({ mode: TemplateBrowserMode.Pick, target: moduleTarget, current: { kind: TemplateReferenceKind.Application, id: salesHub.id.toUpperCase() } }));

    it('should say which it is, whatever the case of the identifier', () => model.entries.filter(entry => entry.current).map(entry => entry.displayName).should.deep.equal(['Sales hub']));
    it('should be of the application\'s own', () => model.entries.find(entry => entry.current)!.origin.should.equal(TemplateOrigin.Own));
});
