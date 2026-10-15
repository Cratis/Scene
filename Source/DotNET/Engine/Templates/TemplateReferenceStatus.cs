// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Templates;

/// <summary>
/// The outcome of resolving a <see cref="Cratis.Scene.Model.Screens.TemplateReference"/> against a <see cref="TemplateLibrary"/>.
/// </summary>
public enum TemplateReferenceStatus
{
    /// <summary>The reference names a template that exists, at a version the reference accepts.</summary>
    Resolved = 0,

    /// <summary>The reference is not well formed: an own reference carrying a blueprint or version, a blueprint reference without a blueprint, or an invalid version range.</summary>
    Malformed = 1,

    /// <summary>No blueprint package of that name is available.</summary>
    UnknownBlueprint = 2,

    /// <summary>The installed version of the blueprint is outside the reference's version range: the blueprint has drifted from what was chosen.</summary>
    VersionNotSatisfied = 3,

    /// <summary>The blueprint or workspace has no template of that name.</summary>
    UnknownTemplate = 4
}
