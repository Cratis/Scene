// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Catalogue;

/// <summary>
/// The value of a token in one theme and mode.
/// </summary>
/// <param name="Theme">The theme.</param>
/// <param name="Mode">The mode.</param>
/// <param name="Value">The value.</param>
public record DesignTokenValue(string Theme, string Mode, string Value);
