// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Interactions;

/// <summary>
/// Defines the built-in interaction kinds - what a user or a lifecycle did, rather than something the
/// document declared.
/// </summary>
/// <remarks>
/// Append only. A renderer that does not know a member reports it rather than guessing, so members are never
/// renumbered or reordered.
/// </remarks>
public enum InteractionTriggerKind
{
    /// <summary>The element was activated - clicked, tapped, or confirmed from the keyboard.</summary>
    Click = 0,

    /// <summary>The element was activated twice.</summary>
    DoubleClick = 1,

    /// <summary>Selection changed in an items control.</summary>
    Select = 2,

    /// <summary>A form was submitted and passed the modeled validation.</summary>
    Submit = 3,

    /// <summary>A bound value changed.</summary>
    Change = 4,

    /// <summary>The element or screen became live.</summary>
    Load = 5,

    /// <summary>The element or screen was torn down.</summary>
    Unload = 6,

    /// <summary>The screen was navigated to.</summary>
    Enter = 7,

    /// <summary>The screen was navigated away from.</summary>
    Leave = 8
}
