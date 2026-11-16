// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { blueprintPreviewBundles } from '../../BlueprintPreview/blueprintPreviewCatalog';
import { ProfileBlockerKind } from '../ProfileBlockerKind';
import { defaultUiProfileSettings } from '../defaultUiProfileSettings';
import { findProfileBlockers } from '../findProfileBlockers';

describe('when the default template is chosen', () => {
    const base = defaultUiProfileSettings(blueprintPreviewBundles);
    const applicationTemplates = [{ id: '00000000-0000-4000-8000-000000000123', name: 'Main' }];
    const kindsFor = (defaultScreenTemplate: string, templates = applicationTemplates) =>
        findProfileBlockers({ ...base, defaultScreenTemplate }, blueprintPreviewBundles, [], templates).map(blocker => blocker.kind);

    it('should accept no default at all', () => {
        kindsFor('').should.be.empty;
    });

    it('should accept a blueprint template that fits the shell', () => {
        kindsFor('ModuleWorkspace').should.be.empty;
    });

    it('should accept a template built for the application', () => {
        kindsFor('00000000-0000-4000-8000-000000000123').should.be.empty;
    });

    it('should block on an application template that no longer exists', () => {
        kindsFor('00000000-0000-4000-8000-000000000123', []).should.deep.equal([ProfileBlockerKind.DefaultScreenTemplateUnavailable]);
    });

    it('should block on a blueprint template no package provides', () => {
        kindsFor('Gone').should.deep.equal([ProfileBlockerKind.DefaultScreenTemplateUnavailable]);
    });

    it('should block on a blueprint template that does not fit the shell', () => {
        kindsFor('FeatureSection').should.deep.equal([ProfileBlockerKind.DefaultScreenTemplateIncompatible]);
    });
});
