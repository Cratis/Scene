// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { dialogTemplateOutlets, navigationItemsAsOutletContribution, toolbarAsOutletRefinement } from '../index';
import { corpus, describeDialogOutlet } from './given/outlet_fixtures';

describe('when folding existing concepts into outlets', () => {
    for (const fixture of corpus.dialogTemplates) {
        it(`should offer the dialog outlets when ${fixture.name}`, () =>
            dialogTemplateOutlets(fixture.template).map(describeDialogOutlet).should.deep.equal(fixture.expected));
    }

    for (const fixture of corpus.navigationContributions) {
        it(`should contribute to the outlet of navigation when ${fixture.name}`, () =>
            navigationItemsAsOutletContribution(fixture.outlet, fixture.items).should.deep.equal(fixture.expected));
    }

    for (const fixture of corpus.toolbars) {
        it(`should refine the toolbar outlet when ${fixture.name}`, () =>
            toolbarAsOutletRefinement(fixture.toolbar).should.deep.equal(fixture.expected));
    }
});
