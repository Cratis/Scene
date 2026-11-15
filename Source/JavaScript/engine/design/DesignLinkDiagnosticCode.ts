// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** What can be wrong linking a design-system component to the Scene component that renders it. The codes are camelCase and engine-owned. */
export enum DesignLinkDiagnosticCode {
    /** No active package declares a component the design-system component names (by its name or its `maps to`); nothing renders its anatomy. */
    ComponentUnbound = 'componentUnbound',

    /** The component is found but declares no anatomy, so it cannot take any look from the design system. */
    ComponentWithoutAnatomy = 'componentWithoutAnatomy',

    /** The design system declares a part the component does not draw. */
    PartUnsupported = 'partUnsupported',

    /** The design system declares a variant the component does not render. */
    VariantUnsupported = 'variantUnsupported',

    /** The design system declares a state the component does not react to. */
    StateUnsupported = 'stateUnsupported',

    /** The design system declares variants, but the component has no property (`variant` or `emphasis`) to choose one by. */
    VariantPropertyMissing = 'variantPropertyMissing',
}
