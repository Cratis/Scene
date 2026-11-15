// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { blueprintPreviewBundles } from '../../BlueprintPreview/blueprintPreviewCatalog';
import { ProfileBlocker } from '../ProfileBlocker';
import { ProfileBlockerKind } from '../ProfileBlockerKind';
import { defaultUiProfileSettings } from '../defaultUiProfileSettings';
import { findProfileBlockers } from '../findProfileBlockers';

describe('when existing screens use what the draft removes', () => {
    let blockers: ProfileBlocker[];

    beforeEach(() => {
        blockers = findProfileBlockers(defaultUiProfileSettings(blueprintPreviewBundles), blueprintPreviewBundles, [
            {
                screen: 'Orders',
                layouts: ['Sidebar'],
                screenTemplates: ['Kanban'],
                dialogTemplates: ['WizardDialog'],
                components: ['sparklineRibbon'],
                slots: [{ owner: 'CrudList', slot: 'footer' }, { owner: 'Kanban', slot: 'lane' }],
            },
        ]);
    });

    const subjectsOf = (kind: ProfileBlockerKind) => blockers.filter(blocker => blocker.kind === kind).map(blocker => blocker.subject);

    it('should block on an unavailable layout, naming the screen that uses it', () => {
        subjectsOf(ProfileBlockerKind.UsedLayoutUnavailable).should.deep.equal(['Sidebar']);
        blockers.find(blocker => blocker.kind === ProfileBlockerKind.UsedLayoutUnavailable)!.detail!.should.equal('Orders');
    });

    it('should block on unavailable screen and dialog templates', () => {
        subjectsOf(ProfileBlockerKind.UsedScreenTemplateUnavailable).should.deep.equal(['Kanban']);
        subjectsOf(ProfileBlockerKind.UsedDialogTemplateUnavailable).should.deep.equal(['WizardDialog']);
    });

    it('should block on a component no package supplies', () => {
        subjectsOf(ProfileBlockerKind.UsedComponentUnavailable).should.deep.equal(['sparklineRibbon']);
    });

    it('should block on a slot the template no longer declares, but not on a slot of a missing template', () => {
        subjectsOf(ProfileBlockerKind.UsedSlotUnavailable).should.deep.equal(['CrudList.footer']);
    });
});
