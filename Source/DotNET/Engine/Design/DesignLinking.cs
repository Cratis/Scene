// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Design;

/// <summary>
/// The result of linking a design system to the active packages.
/// </summary>
/// <param name="Links">One link for each design-system component that found its Scene component.</param>
/// <param name="Diagnostics">Every mismatch.</param>
public record DesignLinking(IReadOnlyList<DesignLink> Links, IReadOnlyList<DesignLinkDiagnostic> Diagnostics);
