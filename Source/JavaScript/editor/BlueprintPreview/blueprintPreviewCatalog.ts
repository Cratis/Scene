// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScenePackage, Theme } from '@cratis/scene.model';
import { PackageCatalog, toComponentCatalog } from '@cratis/scene.engine';
import { ComponentRegistry, ScenePackageBundle, corePackage, mergePackageRegistries } from '@cratis/scene.react';
import { cratisComponentsPackage } from '@cratis/scene.components';
import { primeReactPackage } from '@cratis/scene.primereact';
import { tailwindPackage } from '@cratis/scene.tailwind';
import { defaultBlueprint } from '@cratis/scene.blueprint.default';
import { componentsBlueprint } from '@cratis/scene.blueprint.components';
import { approvalsBlueprint } from '@cratis/scene.blueprint.approvals';
import { bookingsBlueprint } from '@cratis/scene.blueprint.bookings';
import { catalogBlueprint } from '@cratis/scene.blueprint.catalog';
import { contractsBlueprint } from '@cratis/scene.blueprint.contracts';
import { crmBlueprint } from '@cratis/scene.blueprint.crm';
import { customerPortalBlueprint } from '@cratis/scene.blueprint.customer-portal';
import { invoicingBlueprint } from '@cratis/scene.blueprint.invoicing';
import { ordersBlueprint } from '@cratis/scene.blueprint.orders';
import { ticketingBlueprint } from '@cratis/scene.blueprint.ticketing';
import { vendorsBlueprint } from '@cratis/scene.blueprint.vendors';
import { workOrdersBlueprint } from '@cratis/scene.blueprint.work-orders';
import { lucidePackage } from '../IconLibraries/Lucide';

/**
 * The domain blueprints Studio ships: ready-made applications (screens, templates, sample data) that a UI profile can add for their templates.
 * They are listed by the blueprint gallery (StudioIssues#667), which reads the same manifests - there is no second list of what exists.
 */
export const domainBlueprints: ScenePackageBundle[] = [
    approvalsBlueprint, bookingsBlueprint, catalogBlueprint, contractsBlueprint, crmBlueprint, customerPortalBlueprint,
    invoicingBlueprint, ordersBlueprint, ticketingBlueprint, vendorsBlueprint, workOrdersBlueprint,
];

/**
 * Every Scene package bundle Studio has loaded.
 *
 * This is the one thing Studio has that the blueprint package's own gallery preview does not: all four
 * dependency bundles (and the Lucide icon library) are real npm dependencies here, so a screen naming `dataTable` or `tag` resolves to
 * a component that actually exists. The blueprint deliberately takes no bundler dependency on PrimeReact
 * or Cratis Components - a blueprint declares its dependencies in its manifest, not in its import graph -
 * which is why its own preview falls back to a profile that ranks `core` first and accepts placeholders
 * for everything else. Studio does not need that fallback and must not copy it.
 *
 * There is no backend slice behind this page, no read model and nothing persisted: the catalog is exactly
 * what the running bundle has imported, read at module load.
 */
export const blueprintPreviewBundles: ScenePackageBundle[] = [
    corePackage,
    tailwindPackage,
    primeReactPackage,
    cratisComponentsPackage,
    defaultBlueprint,
    componentsBlueprint,
    ...domainBlueprints,
    lucidePackage,
];

/**
 * The package catalog, taken from each bundle's own manifest.
 *
 * Read from the manifests rather than written out, because a hand-copied component list is a second
 * source of truth that drifts the first time a package gains a component - and the only symptom is a
 * dashed red placeholder in the middle of an otherwise fine screen.
 */
export const blueprintPreviewCatalog: ScenePackage[] = blueprintPreviewBundles.map(bundle => bundle.manifest);

/**
 * The merged component registry every preview renders against.
 *
 * Registry keys carry their package name, so merging cannot collide and merge order does not matter -
 * which package wins a *bare* name is decided later, by `resolveComponentName` walking the profile's
 * priority order.
 */
export const blueprintPreviewRegistry: ComponentRegistry = mergePackageRegistries(blueprintPreviewBundles);

/**
 * The component-name catalog `resolveComponentName` resolves against, keyed by package name.
 */
export const blueprintPreviewComponentCatalog: PackageCatalog = toComponentCatalog(blueprintPreviewCatalog);

/**
 * Every theme any loaded package ships - the blueprint's two and PrimeReact's free PrimeTek presets.
 *
 * Deliberately unfiltered: `filterCompatibleThemes` is what narrows this to the themes a given profile
 * can actually pick, and a picker fed a pre-narrowed list has nothing to narrow.
 */
export const blueprintPreviewThemes: Theme[] = blueprintPreviewBundles.flatMap(bundle => bundle.themes ?? []);

/**
 * The blueprints available to preview.
 *
 * Two, and the second is the interesting one: `Cratis.Blueprint.Components` declares no layouts of its own
 * and depends on `Cratis.Blueprint.Default` for the application shell, so selecting it pulls the default
 * blueprint in behind it. That is a blueprint layered on a blueprint, and the dependency resolver treats
 * it like any other - which is the whole point of the packages being declared rather than assumed.
 */
export const previewableBlueprints: ScenePackageBundle[] = [defaultBlueprint, componentsBlueprint];

/**
 * The blueprint previewed when the page opens.
 */
export const previewedBlueprint: ScenePackageBundle = defaultBlueprint;
