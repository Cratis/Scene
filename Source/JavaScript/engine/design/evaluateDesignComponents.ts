// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DesignComponent, ResolvedDesignComponent, ResolvedDesignVariant } from '@cratis/scene.model';

/** What {@link evaluateDesignComponents} produced. */
export interface EvaluatedDesignComponents {
    /** The components with every part resolved to a value. */
    components: ResolvedDesignComponent[];

    /** Each part whose token role has no value, as a message naming the component, variant, state and part. */
    problems: string[];
}

/**
 * Resolves the anatomy of a design system's components against token values: every part of every variant, and of every state
 * (the state's own parts merged over the variant's), becomes the value of the token role it names.
 *
 * A part whose role has no value is left out and, unless `reportMissing` is off, reported; the result never carries a guessed value.
 *
 * @param components The components, as a design system declares them.
 * @param tokens The value of each token role, keyed by `<category>.<name>`.
 * @param reportMissing Whether a part whose role has no value is a problem. A theme a package ships covers only the roles it knows, so the host passes `false` for it and the package's own fallback applies.
 * @returns The resolved components and what could not be resolved.
 */
export function evaluateDesignComponents(components: readonly DesignComponent[], tokens: Readonly<Record<string, string>>, reportMissing = true): EvaluatedDesignComponents {
    const problems: string[] = [];
    const resolve = (component: string, variant: string, state: string | undefined, part: string, role: string, into: Record<string, string>) => {
        const value = tokens[role];
        if (value === undefined) {
            if (reportMissing) problems.push(`${component}.${variant}${state === undefined ? '' : `.${state}`}: part '${part}' refers to '${role}', which has no value.`);
            return;
        }

        into[part] = value;
    };

    return {
        components: components.map(component => ({
            name: component.name,
            variants: component.variants.map((variant): ResolvedDesignVariant => {
                const parts: Record<string, string> = {};
                for (const [part, role] of Object.entries(variant.parts)) resolve(component.name, variant.name, undefined, part, role, parts);

                const states: Record<string, Record<string, string>> = {};
                for (const [state, overrides] of Object.entries(variant.states ?? {})) {
                    const resolved: Record<string, string> = { ...parts };
                    for (const [part, role] of Object.entries(overrides)) resolve(component.name, variant.name, state, part, role, resolved);
                    states[state] = resolved;
                }

                return Object.keys(states).length === 0 ? { name: variant.name, parts } : { name: variant.name, parts, states };
            }),
        })),
        problems,
    };
}
