// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Editing;

/// <summary>
/// The screen, template or layout being edited. It decides what is local: what the scope owns may change, and what it
/// inherits from an outer template or layout may not, unless its owner exposed it.
/// </summary>
/// <param name="Kind">What kind of thing is being edited.</param>
/// <param name="Name">Its name.</param>
/// <param name="Layout">For a screen template, the layout it sits in. Optional when the document has a single layout.</param>
public record EditingScope(EditingScopeKind Kind, string Name, string? Layout = null);
