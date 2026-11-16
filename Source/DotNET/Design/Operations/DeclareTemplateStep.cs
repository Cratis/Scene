// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;

namespace Cratis.Scene.Design.Operations;

/// <summary>Declares a screen template in the document, or replaces the one of its name.</summary>
/// <param name="Template">The template, as Scene JSON.</param>
internal sealed record DeclareTemplateStep(JsonObject Template) : LoweredStep;
