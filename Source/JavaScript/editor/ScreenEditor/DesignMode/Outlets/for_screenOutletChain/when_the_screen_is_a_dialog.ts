// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { OutletKind } from '@cratis/scene.model';
import { OutletLevelKind } from '@cratis/scene.engine';
import { dialogTemplateOf } from '../../../Templates/dialogActionsChrome';
import { editingLevelsOf, screenOutletChain } from '../../../Outlets/screenOutletChain';
import { catalogDocument, screen } from '../given/productCatalog';
import { orderDialogDocument } from '../given/orderDialog';

describe('when the screen is a dialog', () => {
    const document = orderDialogDocument();
    const { chain } = screenOutletChain({ document, screen, dialogTemplate: dialogTemplateOf(document) });
    it('should put the dialog template above the screen that refines it', () =>
        chain.map(level => `${level.kind}:${level.name}`).should.deep.equal(['layout:Application', 'layout:StudioScreen', 'template:FormDialog', 'screen:Screen']));
    it('should have the dialog template declare the actions outlet', () => chain.find(level => level.kind === OutletLevelKind.Template)!.outlets![0].name.should.equal('actions'));
    it('should declare it as an outlet of actions', () => chain.find(level => level.kind === OutletLevelKind.Template)!.outlets![0].kind.should.equal(OutletKind.Actions));
    it('should not offer the dialog template as a level to edit at', () => editingLevelsOf(chain).map(level => level.name).should.deep.equal([screen]));
});

describe('when the screen template already declares an outlet called actions', () => {
    const document = catalogDocument({ screenTemplates: [{ name: 'ListPage', slots: [], outlets: [{ name: 'actions', kind: OutletKind.Actions, defaults: [] }] }] } as never);
    const { chain } = screenOutletChain({ document, screen, dialogTemplate: dialogTemplateOf(document) });
    it('should leave the outlet to the template that declares it', () => chain.filter(level => (level.outlets ?? []).some(outlet => outlet.name === 'actions')).map(level => level.name).should.deep.equal(['ListPage']));
});

describe('when the screen is not a dialog', () => {
    const { chain } = screenOutletChain({ document: catalogDocument(), screen });
    it('should have no dialog template in its chain', () => chain.some(level => level.name === 'FormDialog').should.be.false);
});
