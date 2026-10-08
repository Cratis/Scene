// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Screens;

/// <summary>
/// Optional semantic and browsing metadata. Type and category are open strings so packages can
/// introduce their own vocabulary without a Scene release. Category never determines applicability.
/// </summary>
/// <param name="Type">Semantic role: ApplicationShell, Workspace, List, Detail, Form, Dialog or a custom string.</param>
/// <param name="Category">A package-defined browse category, preserved even when a host does not recognize it.</param>
/// <param name="Scopes">Explicit scope restriction. Null uses the structural role; an empty list allows no scope.</param>
public record TemplateMetadata(string? Type = null, string? Category = null, IReadOnlyList<TemplateScope>? Scopes = null);
