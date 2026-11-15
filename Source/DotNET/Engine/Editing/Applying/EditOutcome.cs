// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Editing;

namespace Cratis.Scene.Engine.Editing.Applying;

/// <summary>
/// The outcome of applying an edit.
/// </summary>
/// <param name="Model">The document after the edit - a new object. When the edit was refused this is the document that was passed in, unchanged and the very same object.</param>
/// <param name="Diagnostics">What was found: errors when the edit was refused, warnings when it went ahead with a caveat.</param>
/// <param name="Applied">Whether the edit was applied.</param>
public sealed record EditOutcome(SceneDocument Model, IReadOnlyList<SceneDiagnostic> Diagnostics, bool Applied);
