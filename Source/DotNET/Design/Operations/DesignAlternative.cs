// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Operations;

/// <summary>
/// The nearest thing that would be accepted: operations to apply, or a change to propose to the design system.
/// </summary>
/// <param name="Label">What it offers.</param>
/// <param name="Operations">The operations to apply.</param>
/// <param name="Proposal">The change to propose to the design system.</param>
public record DesignAlternative(string Label, IReadOnlyList<DesignOperation>? Operations = null, DesignSystemProposal? Proposal = null);
