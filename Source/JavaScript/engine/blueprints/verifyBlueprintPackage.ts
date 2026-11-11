// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind } from '@cratis/scene.model';
import { isValidVersion } from '../packageVersionRange';
import { validateSampleDataPackages } from '../sampleData/validateSampleDataPackages';
import { TemplateSource } from '../templates/TemplateSource';
import { BlueprintSource } from './BlueprintSource';
import { blueprintMetadataProblems, sampleDataFileProblems } from './blueprintMetadataProblems';
import { foundationPackageName } from './blueprintRules';
import { placementProblems } from './placementProblems';
import { templateProblems } from './templateProblems';

/** How a blueprint is verified. */
export interface BlueprintVerificationOptions {
    /** The package that provides the foundation set a domain blueprint must depend on. Defaults to {@link foundationPackageName}. */
    foundationPackage?: string;

    /** Whether a package without blueprint metadata is a problem. Set for every domain blueprint; unset for a package that only provides foundation layouts and templates. */
    requireBlueprintMetadata?: boolean;
}

/**
 * The definition of done for a blueprint (spec Part B 6), as rules a package can be held to: valid manifest and version; for a domain
 * blueprint its domain, description, thumbnail and screen set; every template with complete metadata, a category, a type from the
 * vocabulary, a description and a thumbnail; every template placed by the slot resolver, with nothing unplaced, ambiguous or nested in
 * itself (ambiguity is only a problem for a domain blueprint: the foundation's generic nesting chain fits slots many templates declare, and is chosen explicitly); sample data present, locale-tagged and valid; and a dependency on the foundation set. The C# engine
 * (`BlueprintVerification.Verify`) reports the same problems in the same order; both are asserted against
 * `blueprint-verification-fixtures.json`.
 *
 * @param source The blueprint to verify.
 * @param library The other packages available - above all the foundation set - so templates can be placed into its layouts and checked against its versions.
 * @param options How strictly to verify.
 * @returns The problems; empty when the blueprint is done.
 */
export function verifyBlueprintPackage(source: BlueprintSource, library: readonly TemplateSource[] = [], options: BlueprintVerificationOptions = {}): string[] {
    const manifest = source.manifest;
    const label = `Blueprint '${manifest.name}'`;

    if (manifest.kind !== PackageKind.Blueprint) return [`Package '${manifest.name}' is not a Blueprint package`];

    const domain = manifest.blueprint !== undefined;
    return [
        ...versionProblems(label, manifest),
        ...blueprintProblems(source, library, label, options),
        ...validateSampleDataPackages([{ manifest, packs: source.packs }]),
        ...sampleDataFileProblems(source, label),
        ...templateProblems(source, library, domain),
        ...placementProblems(source, library, label, domain),
    ];
}

function versionProblems(label: string, manifest: BlueprintSource['manifest']): string[] {
    return isValidVersion(manifest.version) ? [] : [`${label} declares an invalid version '${manifest.version ?? ''}'`];
}

function blueprintProblems(source: BlueprintSource, library: readonly TemplateSource[], label: string, options: BlueprintVerificationOptions): string[] {
    if (!source.manifest.blueprint) return options.requireBlueprintMetadata ? [`${label} declares no blueprint metadata (domain, description, thumbnail and screen set)`] : [];

    const available = new Set([...(source.screenTemplates ?? []), ...library.flatMap(other => other.screenTemplates ?? [])].map(template => template.name));
    return blueprintMetadataProblems(source, label, available, options.foundationPackage ?? foundationPackageName);
}
