// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.AI.DesignSystem;

/// <summary>
/// What a source a design system is established from is.
/// </summary>
public enum DesignSourceKind
{
    /// <summary>
    /// A file of the product: a stylesheet, a token file, a Tailwind configuration, the existing Screenplay of its design.
    /// </summary>
    File = 0,

    /// <summary>
    /// A file a person uploaded to say what the brand is: a style guide, a token export.
    /// </summary>
    BrandFile = 1,

    /// <summary>
    /// What a component library or a package manifest says the screens are built from.
    /// </summary>
    ComponentLibrary = 2,

    /// <summary>
    /// A capture of the running application: an image of a screen in a mode.
    /// </summary>
    RunningApp = 3,
}
