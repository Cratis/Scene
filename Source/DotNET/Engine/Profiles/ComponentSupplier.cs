// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// Who supplies a component name.
/// </summary>
/// <param name="Component">The component name.</param>
/// <param name="Winner">The strongest package in the list that supplies it.</param>
/// <param name="Others">The other listed packages that also supply it, strongest first.</param>
public record ComponentSupplier(
    string Component,
    string Winner,
    IReadOnlyList<string> Others);
