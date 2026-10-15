// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Screens;

/// <summary>
/// Where a referenced template comes from.
/// </summary>
public enum TemplateReferenceSource
{
    /// <summary>
    /// A template the user created in the workspace.
    /// </summary>
    Own = 0,

    /// <summary>
    /// A template shipped by a blueprint package, referenced by blueprint name, template name and version range.
    /// </summary>
    Blueprint = 1
}
