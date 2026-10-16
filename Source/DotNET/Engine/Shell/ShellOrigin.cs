// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Shell;

/// <summary>
/// Where the effective shell was found, in resolution order.
/// </summary>
public enum ShellOrigin
{
    /// <summary>
    /// The profile's root template reference.
    /// </summary>
    Root = 0,

    /// <summary>
    /// The profile's legacy layout name.
    /// </summary>
    LegacyLayout = 1,

    /// <summary>
    /// The default layout of the first installed blueprint.
    /// </summary>
    BlueprintDefault = 2,

    /// <summary>
    /// Nothing was chosen or found: the built-in bare shell with one content outlet and no chrome.
    /// </summary>
    Bare = 3
}
