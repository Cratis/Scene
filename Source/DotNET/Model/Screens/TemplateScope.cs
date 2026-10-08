// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Screens;

/// <summary>
/// The application hierarchy at which a reusable template is selected.
/// </summary>
public enum TemplateScope
{
    /// <summary>
    /// The application's navigational shell.
    /// </summary>
    Application = 0,

    /// <summary>
    /// A module inside the application shell.
    /// </summary>
    Module = 1,

    /// <summary>
    /// A feature inside a module.
    /// </summary>
    Feature = 2,

    /// <summary>
    /// A recursively nested feature.
    /// </summary>
    Subfeature = 3,

    /// <summary>
    /// An individual slice.
    /// </summary>
    Slice = 4
}
