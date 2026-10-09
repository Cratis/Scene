// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplateMetadata } from '@cratis/scene.model';
import { isValidVersionRange } from '../packageVersionRange';
import { isAbsoluteHttpsUrl, isSpdxExpression } from './templateMetadataRules';

/**
 * Checks that a template carries the compatibility, attribution and license metadata every shipped template
 * needs, and that each value is well formed. The C# engine (`TemplateMetadataValidation.Validate`) reports the
 * same problems in the same order; both are asserted against `template-metadata-fixtures.json`.
 */
export function validateTemplateMetadata(name: string, metadata: TemplateMetadata | undefined): string[] {
    const problems: string[] = [];
    const compatibility = metadata?.compatibility;

    if (!compatibility) {
        problems.push(`Template '${name}' declares no compatibility`);
    } else {
        if (!compatibility.scene?.trim()) {
            problems.push(`Template '${name}' declares no Scene version range`);
        } else if (!isValidVersionRange(compatibility.scene)) {
            problems.push(`Template '${name}' declares an invalid Scene version range '${compatibility.scene}'`);
        }

        for (const requirement of compatibility.packages ?? []) {
            if (!requirement.name?.trim()) {
                problems.push(`Template '${name}' declares a package requirement without a name`);
            } else if (!isValidVersionRange(requirement.versionRange)) {
                problems.push(`Template '${name}' declares an invalid version range '${requirement.versionRange}' for package '${requirement.name}'`);
            }
        }
    }

    const attribution = metadata?.attribution;
    if (!attribution?.author?.trim()) {
        problems.push(`Template '${name}' declares no author`);
    }

    if (attribution?.url !== undefined && !isAbsoluteHttpsUrl(attribution.url)) {
        problems.push(`Template '${name}' declares an attribution URL '${attribution.url}' that is not an absolute https URL`);
    }

    if (!metadata?.license?.trim()) {
        problems.push(`Template '${name}' declares no license`);
    } else if (!isSpdxExpression(metadata.license)) {
        problems.push(`Template '${name}' declares '${metadata.license}', which is not an SPDX license expression`);
    }

    if (metadata?.licenseUrl !== undefined && !isAbsoluteHttpsUrl(metadata.licenseUrl)) {
        problems.push(`Template '${name}' declares a license URL '${metadata.licenseUrl}' that is not an absolute https URL`);
    }

    return problems;
}
