// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Layouts;

/// <summary>
/// A <see cref="FlowContainer"/> that arranges its children vertically.
/// </summary>
public record FlowColumn : FlowContainer
{
    /// <inheritdoc/>
    public override FlowContainerKind Kind => FlowContainerKind.Column;
}
