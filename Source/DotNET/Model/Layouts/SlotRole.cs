// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Layouts;

/// <summary>
/// What kind of region a <see cref="Slot"/> is, which tells a renderer how much of the page it takes and how it behaves.
/// </summary>
public enum SlotRole
{
    /// <summary>The whole page: the region a screen replaces when someone navigates.</summary>
    Page = 0,

    /// <summary>A region next to others on the page, such as a detail pane beside a list.</summary>
    Pane = 1,

    /// <summary>A panel that slides in over or next to the page and can be closed, such as a drawer.</summary>
    Panel = 2,
}
