// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Templates;

/// <summary>
/// Every template a host can choose from: the ones the user created in the workspace and the ones blueprint packages ship.
/// </summary>
/// <param name="Own">The workspace's own templates, or <see langword="null"/> when there are none. Its manifest is never treated as a blueprint.</param>
/// <param name="Blueprints">The blueprint packages and the templates they ship, in browse order.</param>
public record TemplateLibrary(TemplateSource? Own, IReadOnlyList<TemplateSource> Blueprints);
