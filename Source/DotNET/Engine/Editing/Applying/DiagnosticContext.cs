// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Editing.Applying;

/// <summary>
/// What an edit knows about the thing a finding is about.
/// </summary>
/// <param name="NodeId">The node.</param>
/// <param name="Component">The id of the component.</param>
/// <param name="Instance">The instance.</param>
sealed record DiagnosticContext(string? NodeId = null, string? Component = null, string? Instance = null);
