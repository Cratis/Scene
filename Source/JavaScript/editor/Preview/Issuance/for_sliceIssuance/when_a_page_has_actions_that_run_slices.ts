// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SliceKind } from '@cratis/scene.model';
import { sliceIssuanceOf } from '../sliceIssuance';
import type { PreviewScene } from '../../PreviewScene';

const scene = {
    layouts: [{ name: 'Plain', slots: [{ name: 'related' }, { name: 'actions' }] }],
    screenTemplates: [],
    dialogTemplates: [],
    screens: [
        {
            name: 'ProductPage', layout: 'Plain', owner: 'Shop.Products.Details', forms: [], contributions: [], slotContent: {
                related: [
                    { id: 'describe', componentName: 'core:action', properties: { command: 'Describe', label: null }, slots: {} },
                    { id: 'approve', componentName: 'core:guarded-action', properties: { label: 'Approve for sale', alternatives: [{ command: 'Approve' }] }, slots: {} },
                ],
            },
        },
        { name: 'DescribeDialog', layout: 'Plain', owner: 'Shop.Products.Describe', forms: [], contributions: [], slotContent: { actions: [{ id: 'submit', componentName: 'core:action', properties: { command: 'Describe' }, slots: {} }] } },
    ],
    structure: {
        modules: [{
            id: 'Shop', name: 'Shop', slices: [], features: [{
                id: 'Products', name: 'Products', features: [], slices: [
                    { id: 'Describe', name: 'Describe', kind: SliceKind.StateChange, command: 'Describe' },
                    { id: 'Approve', name: 'Approve', kind: SliceKind.StateChange, command: 'Approve' },
                    { id: 'Details', name: 'Details', kind: SliceKind.StateView },
                ],
            }],
        }],
    },
    commandSchemas: { Describe: '{"properties":{"details":{}}}', Approve: '{"properties":{}}' },
} as unknown as PreviewScene;

describe('when a page has actions that run slices', () => {
    const issuance = sliceIssuanceOf(scene);
    const describe_ = issuance.get('Shop.Products.Describe')!;
    const approve = issuance.get('Shop.Products.Approve')!;

    it('should say the action issues the slice whose command it runs', () => describe_.issuedFrom.map(hook => `${hook.screen} > ${hook.outlet} > ${hook.button}`).should.deep.equal(['ProductPage > related > Describe']));
    it('should not count the action on the slice\'s own screen, which submits it', () => describe_.issuedFrom.some(hook => hook.screen === 'DescribeDialog').should.be.false);
    it('should name the action as the element to select', () => describe_.issuedFrom[0].outletElementId?.should.equal('describe'));
    it('should say the hook is an action', () => describe_.issuedFrom[0].action?.should.be.true);
    it('should name the screen\'s owner, for the board to open it', () => describe_.issuedFrom[0].owner?.should.equal('Shop.Products.Details'));
    it('should count every command a guarded action runs, by its label', () => approve.issuedFrom.map(hook => hook.button).should.deep.equal(['Approve for sale']));
});
