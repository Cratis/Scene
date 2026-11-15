// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BlueprintPinStatus } from '@cratis/scene.engine';
import { blueprintPreviewBundles } from '../../BlueprintPreview/blueprintPreviewCatalog';
import { BlueprintInstallState } from '../BlueprintInstallState';
import { describeBlueprintGallery } from '../describeBlueprintGallery';

const nothingAdded = { shell: 'Cratis.Blueprint.Default', templatePacks: [] as string[] };
const byPackage = (cards: ReturnType<typeof describeBlueprintGallery>, name: string) => cards.find(card => card.package === name)!;

describe('when describing the gallery', () => {
    const cards = describeBlueprintGallery(blueprintPreviewBundles, nothingAdded);

    it('should list every domain blueprint Studio ships, in package order', () => {
        cards.map(card => card.package).should.deep.equal([
            'Cratis.Blueprint.Approvals', 'Cratis.Blueprint.Bookings', 'Cratis.Blueprint.Catalog', 'Cratis.Blueprint.Contracts', 'Cratis.Blueprint.Crm', 'Cratis.Blueprint.CustomerPortal',
            'Cratis.Blueprint.Invoicing', 'Cratis.Blueprint.Orders', 'Cratis.Blueprint.Ticketing', 'Cratis.Blueprint.Vendors', 'Cratis.Blueprint.WorkOrders',
        ]);
    });

    it('should not list the foundation, which is not a domain blueprint', () => {
        cards.map(card => card.package).should.not.include('Cratis.Blueprint.Default');
    });

    it('should give every card a thumbnail, a description and a version', () => {
        cards.every(card => card.thumbnail.length > 0 && card.description.length > 0 && /^\d+\.\d+\.\d+/.test(card.version)).should.be.true;
    });

    it('should list what the blueprint gives: its screens in navigation order and its templates by category', () => {
        const crm = byPackage(cards, 'Cratis.Blueprint.Crm');
        crm.screens.length.should.be.greaterThan(10);
        crm.screens[0].name.should.equal('crm.dashboard');
        crm.templateCount.should.equal(crm.templateGroups.flatMap(group => group.templates).length);
        crm.templateGroups.map(group => group.category).should.include('Business / CRM');
    });

    it('should list the sample data of the blueprint, the default pack first', () => {
        const crm = byPackage(cards, 'Cratis.Blueprint.Crm');
        crm.sampleData.map(pack => pack.id).should.deep.equal(['crm-enterprise-en', 'crm-nordic-smb']);
        crm.sampleData[0].default.should.be.true;
    });

    it('should offer every blueprint that is not in the profile', () => {
        cards.every(card => card.state === BlueprintInstallState.Available).should.be.true;
    });
});

describe('when a blueprint is added to the profile', () => {
    const cards = describeBlueprintGallery(blueprintPreviewBundles, { ...nothingAdded, templatePacks: ['Cratis.Blueprint.Crm'] }, new Set(['Cratis.Blueprint.Ticketing']));

    it('should say it is added for its templates', () => byPackage(cards, 'Cratis.Blueprint.Crm').state.should.equal(BlueprintInstallState.TemplatePack));
    it('should say a package the profile only has because another needs it is required', () => byPackage(cards, 'Cratis.Blueprint.Ticketing').state.should.equal(BlueprintInstallState.Required));
    it('should leave the others on offer', () => byPackage(cards, 'Cratis.Blueprint.Approvals').state.should.equal(BlueprintInstallState.Available));
});

describe('when a blueprint is the shell', () => {
    const cards = describeBlueprintGallery(blueprintPreviewBundles, { shell: 'Cratis.Blueprint.Crm', templatePacks: [] });

    it('should say so', () => byPackage(cards, 'Cratis.Blueprint.Crm').state.should.equal(BlueprintInstallState.Shell));
});

describe('when filtering the gallery', () => {
    it('should keep the blueprints whose description, screens or templates hold every word', () => {
        describeBlueprintGallery(blueprintPreviewBundles, nothingAdded, new Set(), [], 'pipeline deals').map(card => card.package).should.deep.equal(['Cratis.Blueprint.Crm']);
    });

    it('should match on the domain regardless of case', () => {
        describeBlueprintGallery(blueprintPreviewBundles, nothingAdded, new Set(), [], 'TICKETING').map(card => card.package).should.deep.equal(['Cratis.Blueprint.Ticketing']);
    });

    it('should list nothing when no blueprint matches', () => {
        describeBlueprintGallery(blueprintPreviewBundles, nothingAdded, new Set(), [], 'zeppelin').should.be.empty;
    });
});

describe('when references pin a blueprint', () => {
    const version = byPackage(describeBlueprintGallery(blueprintPreviewBundles, nothingAdded), 'Cratis.Blueprint.Crm').version;
    const crm = (references: Parameters<typeof describeBlueprintGallery>[3]) => byPackage(describeBlueprintGallery(blueprintPreviewBundles, nothingAdded, new Set(), references), 'Cratis.Blueprint.Crm');

    it('should say nothing when the reference was chosen from the version on offer', () => {
        (crm([{ package: 'Cratis.Blueprint.Crm', version }]).update === undefined).should.be.true;
    });

    it('should say an update is available when the pin allows the version on offer', () => {
        const update = crm([{ package: 'Cratis.Blueprint.Crm', version: '0.1.0', pin: '>=0.1.0' }]).update!;
        update.status.should.equal(BlueprintPinStatus.UpdateAvailable);
        update.from.should.equal('0.1.0');
    });

    it('should say the pin blocks the update when the version on offer is outside it', () => {
        const update = crm([{ package: 'Cratis.Blueprint.Crm', version: '0.1.0', pin: '^0.1.0' }]).update!;
        update.status.should.equal(BlueprintPinStatus.UpdateBlockedByPin);
        update.to.should.equal(version);
    });

    it('should report the worst of several references', () => {
        const update = crm([
            { package: 'Cratis.Blueprint.Crm', version: '0.1.0', pin: '^0.1.0' },
            { package: 'Cratis.Blueprint.Crm', version: '0.1.0', pin: '^9.0.0' },
        ]).update!;
        update.status.should.equal(BlueprintPinStatus.NotSatisfied);
    });

    it('should ignore references to other blueprints', () => {
        (crm([{ package: 'Cratis.Blueprint.Ticketing', version: '0.1.0' }]).update === undefined).should.be.true;
    });
});
