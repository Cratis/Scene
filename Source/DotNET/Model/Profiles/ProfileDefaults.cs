// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Screens;

namespace Cratis.Scene.Model.Profiles;

/// <summary>
/// Application-wide authoring defaults that belong to the profile rather than to a screen.
/// </summary>
/// <param name="NewScreenTemplate">The template a newly created screen starts from, or <see langword="null"/> when new screens start without one.</param>
public record ProfileDefaults(
    TemplateReference? NewScreenTemplate = null);
