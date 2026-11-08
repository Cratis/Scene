// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Outlets;

/// <summary>
/// What a button of an outlet of actions shows. Whatever it shows, its title stays its accessible name.
/// </summary>
public enum OutletButtonDisplay
{
    /// <summary>The icon followed by the title. The default, and what a button without an icon shows.</summary>
    IconAndTitle = 0,

    /// <summary>Only the icon; the title is the accessible name and the tooltip. A button without an icon shows its title instead.</summary>
    Icon = 1,

    /// <summary>Only the title, even when the button has an icon.</summary>
    Title = 2,
}
