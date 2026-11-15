// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Operations;

/// <summary>
/// What moving a tweak control to a value stands for.
/// </summary>
/// <param name="Operations">The operations a design applies.</param>
/// <param name="Proposals">The changes to propose to the design system - the canvas edits screens only.</param>
public record LoweredTweak(IReadOnlyList<DesignOperation> Operations, IReadOnlyList<DesignSystemProposal> Proposals);
