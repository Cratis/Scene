// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplateBrowserMode } from '../TemplateBrowserMode';
import { TemplateOrigin } from '../TemplateOrigin';
import { describeTemplateBrowser } from '../describeTemplateBrowser';
import { aBrowserInput } from './given/aBrowserInput';

// A shipped template names the component packages whose components it uses (the Default blueprint's AppShell uses PrimeReact and Cratis.Components); Scene's
// template library calls it compatible only when those packages are available. They are in the build, so the browser tells Scene so - and does not
// mark every shell "Cannot run here" (found by the UI profile acceptance suite, StudioIssues#729).
describe('when describing shipped templates that use component packages the build ships', () => {
    const model = describeTemplateBrowser(aBrowserInput({ mode: TemplateBrowserMode.Pick }));
    const blueprint = model.entries.filter(entry => entry.origin === TemplateOrigin.Blueprint);

    it('should list the shells of the foundation blueprint', () => {
        blueprint.map(entry => entry.name).should.include.members(['AppShell', 'FullPage']);
    });

    it('should find every shipped template compatible', () => {
        blueprint.filter(entry => !entry.compatible).map(entry => `${entry.name}: ${entry.problems.join('; ')}`).should.deep.equal([]);
    });
});
