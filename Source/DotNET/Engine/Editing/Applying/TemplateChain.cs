// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Editing;

namespace Cratis.Scene.Engine.Editing.Applying;

/// <summary>
/// The chain of owners an editing scope sits inside: the layout, each template down to the one the scope is in, and the scope
/// itself, outermost first.
/// </summary>
sealed class TemplateChain
{
    /// <summary>
    /// Gets the levels, outermost first.
    /// </summary>
    public List<TemplateChainLevel> Levels { get; } = [];

    /// <summary>
    /// Gets what was found while assembling the chain.
    /// </summary>
    public List<SceneDiagnostic> Diagnostics { get; } = [];
}
