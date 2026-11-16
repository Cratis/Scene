// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Catalogue;

/// <summary>
/// A command the host lets a screen offer.
/// </summary>
/// <param name="Id">Its id.</param>
/// <param name="Name">Its name.</param>
/// <param name="Inputs">The names of its inputs.</param>
public record DesignCommand(string Id, string Name, IReadOnlyList<string> Inputs);
