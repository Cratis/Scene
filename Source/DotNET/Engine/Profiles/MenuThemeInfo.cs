// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// A menu theme with its picker text.
/// </summary>
/// <param name="Id">The menu theme.</param>
/// <param name="Label">The name shown in a picker.</param>
/// <param name="Description">The one-line description.</param>
public record MenuThemeInfo(MenuThemeChoice Id, string Label, string Description);
