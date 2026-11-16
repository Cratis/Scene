// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { approvalsApplication, approvalsComposition, approvalsModule, approvalsNavigationModel } from '@cratis/scene.blueprint.approvals';
import { bookingsApplication, bookingsComposition, bookingsModule, bookingsNavigationModel } from '@cratis/scene.blueprint.bookings';
import { catalogApplication, catalogComposition, catalogModule, catalogNavigationModel } from '@cratis/scene.blueprint.catalog';
import { contractsApplication, contractsComposition, contractsModule, contractsNavigationModel } from '@cratis/scene.blueprint.contracts';
import { crmApplication, crmComposition, crmModule, crmNavigationModel } from '@cratis/scene.blueprint.crm';
import { customerPortalApplication, customerPortalComposition, customerPortalModule, customerPortalNavigationModel } from '@cratis/scene.blueprint.customer-portal';
import type { ApplicationDocument, CompositionOptions } from '@cratis/scene.blueprint.default';
import { invoicingApplication, invoicingComposition, invoicingModule, invoicingNavigationModel } from '@cratis/scene.blueprint.invoicing';
import { ordersApplication, ordersComposition, ordersModule, ordersNavigationModel } from '@cratis/scene.blueprint.orders';
import { supportModule, ticketingApplication, ticketingComposition, ticketingNavigationModel } from '@cratis/scene.blueprint.ticketing';
import { vendorsApplication, vendorsComposition, vendorsModule, vendorsNavigationModel } from '@cratis/scene.blueprint.vendors';
import { workOrdersApplication, workOrdersComposition, workOrdersModule, workOrdersNavigationModel } from '@cratis/scene.blueprint.work-orders';
import type { ApplicationStructureIndex } from '@cratis/scene.engine';
import type { NavigationModel } from '@cratis/scene.model';

/** A domain blueprint as an application that can be previewed: the document, structure and navigation it is made of. */
export interface BlueprintApplication {
    /** The module the blueprint's screens live in: where a preview starts. */
    module: string;

    /** The application with the given sample-data pack active. */
    application(pack?: string): ApplicationDocument;

    /** What the shell's regions show and the items' destinations resolve against. */
    navigationModel(): { structure: ApplicationStructureIndex; navigation: NavigationModel };

    /** What a host composes the screens with. */
    composition: CompositionOptions;
}

/**
 * The domain blueprints that run as an application, by package name. Each blueprint exports its own `<name>Application()`; this is the one place
 * Studio maps them to the package that owns them, so adding a blueprint to the gallery is one entry here and its bundle in the preview catalog.
 */
export const blueprintApplications: Readonly<Record<string, BlueprintApplication>> = {
    'Cratis.Blueprint.Approvals': { module: approvalsModule, application: approvalsApplication, navigationModel: approvalsNavigationModel, composition: approvalsComposition },
    'Cratis.Blueprint.Bookings': { module: bookingsModule, application: bookingsApplication, navigationModel: bookingsNavigationModel, composition: bookingsComposition },
    'Cratis.Blueprint.Catalog': { module: catalogModule, application: catalogApplication, navigationModel: catalogNavigationModel, composition: catalogComposition },
    'Cratis.Blueprint.Contracts': { module: contractsModule, application: contractsApplication, navigationModel: contractsNavigationModel, composition: contractsComposition },
    'Cratis.Blueprint.Crm': { module: crmModule, application: crmApplication, navigationModel: crmNavigationModel, composition: crmComposition },
    'Cratis.Blueprint.CustomerPortal': { module: customerPortalModule, application: customerPortalApplication, navigationModel: customerPortalNavigationModel, composition: customerPortalComposition },
    'Cratis.Blueprint.Invoicing': { module: invoicingModule, application: invoicingApplication, navigationModel: invoicingNavigationModel, composition: invoicingComposition },
    'Cratis.Blueprint.Orders': { module: ordersModule, application: ordersApplication, navigationModel: ordersNavigationModel, composition: ordersComposition },
    'Cratis.Blueprint.Ticketing': { module: supportModule, application: ticketingApplication, navigationModel: ticketingNavigationModel, composition: ticketingComposition },
    'Cratis.Blueprint.Vendors': { module: vendorsModule, application: vendorsApplication, navigationModel: vendorsNavigationModel, composition: vendorsComposition },
    'Cratis.Blueprint.WorkOrders': { module: workOrdersModule, application: workOrdersApplication, navigationModel: workOrdersNavigationModel, composition: workOrdersComposition },
};
