// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Descriptors;
using Cratis.Scene.Model.Editing;

namespace Cratis.Scene.Engine.Editing.Applying;

/// <summary>
/// What a node's properties are.
/// </summary>
/// <param name="Properties">The properties.</param>
/// <param name="Capabilities">What a layout node can do.</param>
/// <param name="Diagnostics">What was found while describing it.</param>
sealed record NodeDescription(IReadOnlyList<PropertyDescriptor> Properties, LayoutCapabilities? Capabilities, IReadOnlyList<SceneDiagnostic> Diagnostics);
