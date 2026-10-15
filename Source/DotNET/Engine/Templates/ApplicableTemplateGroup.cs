// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Templates;

/// <summary>
/// The applicable templates sharing one browse category, in browse order.
/// </summary>
/// <param name="Category">The category, or <see langword="null"/> for templates that declare none. Uncategorized templates are listed last.</param>
/// <param name="Templates">The templates in the category.</param>
public record ApplicableTemplateGroup(string? Category, IReadOnlyList<ApplicableTemplate> Templates);
