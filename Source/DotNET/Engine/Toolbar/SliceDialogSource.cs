// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Toolbar;

/// <summary>
/// Where a slice's dialog template comes from.
/// </summary>
public enum SliceDialogSource
{
    /// <summary>The slice names its own dialog template.</summary>
    Slice = 0,

    /// <summary>The slice names none, so the default form dialog is used.</summary>
    Default = 1,
}
