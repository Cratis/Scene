// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Operations;

/// <summary>
/// What applying operations to a workspace gave.
/// </summary>
/// <param name="Workspace">The workspace after.</param>
/// <param name="Outcomes">One outcome per operation, in order.</param>
/// <param name="Changed">Whether anything of the workspace changed: tweaks and variations only offer choices.</param>
public record DesignApplyResult(DesignWorkspace Workspace, IReadOnlyList<DesignOutcome> Outcomes, bool Changed);
