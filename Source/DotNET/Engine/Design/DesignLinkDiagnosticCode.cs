// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Design;

/// <summary>
/// What can be wrong linking a design-system component to the Scene component that renders it. Serialized in camelCase.
/// </summary>
public enum DesignLinkDiagnosticCode
{
    /// <summary>
    /// No active package declares a component the design-system component names (by its name or its <c language="csharp">maps to</c>); nothing renders its anatomy.
    /// </summary>
    ComponentUnbound = 0,

    /// <summary>
    /// The component is found but declares no anatomy, so it cannot take any look from the design system.
    /// </summary>
    ComponentWithoutAnatomy = 1,

    /// <summary>
    /// The design system declares a part the component does not draw.
    /// </summary>
    PartUnsupported = 2,

    /// <summary>
    /// The design system declares a variant the component does not render.
    /// </summary>
    VariantUnsupported = 3,

    /// <summary>
    /// The design system declares a state the component does not react to.
    /// </summary>
    StateUnsupported = 4,

    /// <summary>
    /// The design system declares variants, but the component has no property (<c language="csharp">variant</c> or <c language="csharp">emphasis</c>) to choose one by.
    /// </summary>
    VariantPropertyMissing = 5
}
