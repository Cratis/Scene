// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Guards;

namespace Cratis.Scene.Screenplay.Forward;

internal enum GuardFieldKind
{
    Unknown = 0,
    Text = 1,
    Number = 2,
    Boolean = 3,
    DateTime = 4,
    Identifier = 5,
    Enumeration = 6,
    Composite = 7,
    Collection = 8
}

/// <summary>The resolved authored type, shared by guard admission and serialization.</summary>
internal sealed record GuardFieldType(GuardFieldKind Kind, bool IsOptional = false, IReadOnlyList<string>? Members = null, string? Reason = null, IReadOnlyList<int>? MemberNumbers = null)
{
    internal static GuardFieldType Unknown(string reason) => new(GuardFieldKind.Unknown, Reason: reason);

    internal bool Admits(GuardOperator operation, object? literal) => Kind != GuardFieldKind.Unknown &&
        (operation is not (GuardOperator.Contains or GuardOperator.StartsWith) || (Kind == GuardFieldKind.Text && literal is string));
}
