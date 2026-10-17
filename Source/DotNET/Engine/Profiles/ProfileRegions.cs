// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// Says which regions a shell exposes. The TypeScript twin is <c language="csharp">describeRegions</c>.
/// </summary>
public static class ProfileRegions
{
    /// <summary>
    /// The DOM attribute a host marks a region's element with.
    /// </summary>
    public const string Attribute = "data-scene-region";

    /// <summary>
    /// Says which regions a shell exposes in a menu mode and state: the same five everywhere, with the menu not drawn while it is hidden - an Overlay
    /// or Drawer menu that is closed, and any menu on a touch screen until it is opened. A region that is not drawn names the one to use instead.
    /// The hamburger is not a region; it only opens and closes the menu.
    /// </summary>
    /// <param name="mode">The menu mode.</param>
    /// <param name="touch">Whether the preview is a touch size class.</param>
    /// <param name="menuOpen">Whether the hidden menu is open.</param>
    /// <returns>The five regions, in the order a designer lists them.</returns>
    public static IReadOnlyList<ProfileRegionInfo> Describe(NavigationMode mode, bool touch, bool menuOpen)
    {
        var hidden = ShellOptions.DescribeBehavior(mode, touch).Presentation == MenuPresentation.Hidden;
        var menuDrawn = !hidden || menuOpen;
        return
        [
            new(ProfileRegion.Identity, "App name and logo", ProfileSection.App, true),
            new(ProfileRegion.Shell, "Shell", ProfileSection.Shell, true),
            new(ProfileRegion.Menu, "Menu", ProfileSection.Menu, menuDrawn, menuDrawn ? null : ProfileRegion.Shell),
            new(ProfileRegion.Content, "Sample data", ProfileSection.SampleData, true),
            new(ProfileRegion.Accent, "Look and accent", ProfileSection.Look, true)
        ];
    }
}
