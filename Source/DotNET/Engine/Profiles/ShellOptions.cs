// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// The typed shell options every root template offers: the navigation mode and the menu theme.
/// </summary>
public static class ShellOptions
{
    /// <summary>
    /// Gets the mode a shell starts in when it declares none.
    /// </summary>
    public const NavigationMode DefaultNavigationMode = NavigationMode.Static;

    /// <summary>
    /// Gets the navigation modes, in the order a picker lists them.
    /// </summary>
    public static readonly IReadOnlyList<NavigationModeInfo> NavigationModes =
    [
        new(NavigationMode.Static, "Static", "240 px sidebar, always visible", MenuPresentation.Sidebar, 240, false, false),
        new(NavigationMode.Overlay, "Overlay", "Menu hidden; the hamburger slides it over the content with no dimming", MenuPresentation.Hidden, null, false, false),
        new(NavigationMode.Slim, "Slim", "68 px rail with icons only", MenuPresentation.Rail, 68, false, false),
        new(NavigationMode.SlimPlus, "Slim+", "92 px rail with an icon and a small label under it", MenuPresentation.Rail, 92, false, false),
        new(NavigationMode.Compact, "Compact", "190 px sidebar, tighter rows, smaller type", MenuPresentation.Sidebar, 190, false, false),
        new(NavigationMode.Horizontal, "Horizontal", "Items in the top bar; the sidebar disappears", MenuPresentation.TopBar, null, false, false),
        new(NavigationMode.Reveal, "Reveal", "Slim rail that expands to the full menu on hover", MenuPresentation.Reveal, 68, false, true),
        new(NavigationMode.Drawer, "Drawer", "Menu hidden; the hamburger opens it with a dimmed scrim; clicking the scrim closes it", MenuPresentation.Hidden, null, true, false)
    ];

    /// <summary>
    /// Gets the menu themes, in the order a picker lists them.
    /// </summary>
    public static readonly IReadOnlyList<MenuThemeInfo> MenuThemes =
    [
        new(MenuThemeChoice.Light, "Light", "A light menu surface"),
        new(MenuThemeChoice.Dark, "Dark", "A dark menu surface"),
        new(MenuThemeChoice.Primary, "Primary", "The menu surface uses the accent colour")
    ];

    /// <summary>
    /// Reads a stored navigation mode, accepting the legacy strings (<c language="csharp">slim-plus</c>) and any letter case, so a stored profile never has to be rewritten.
    /// </summary>
    /// <param name="value">The stored value.</param>
    /// <returns>The mode, or <see langword="null"/> when the value names none.</returns>
    public static NavigationMode? Normalize(string? value)
    {
        if (value is null)
        {
            return null;
        }

        var key = new string([.. value.Trim().ToLowerInvariant().Replace("+", "plus", StringComparison.Ordinal).Where(char.IsLetter)]);
        var found = NavigationModes.FirstOrDefault(mode => mode.Id.ToString().Equals(key, StringComparison.OrdinalIgnoreCase));
        return found?.Id;
    }

    /// <summary>
    /// Describes what the menu does in a mode. On a touch size class the menu is always a drawer with a scrim, whatever the mode.
    /// </summary>
    /// <param name="mode">The chosen mode.</param>
    /// <param name="touch">Whether the target is a touch size class.</param>
    /// <returns>The behavior a host previews.</returns>
    public static MenuBehavior DescribeBehavior(NavigationMode mode, bool touch)
    {
        var info = NavigationModes.First(candidate => candidate.Id == mode);
        if (!touch)
        {
            return new MenuBehavior(mode, info.Presentation, info.Width, info.Scrim, mode, null);
        }

        var note = mode == NavigationMode.Drawer
            ? null
            : info.NeedsHover
                ? $"{info.Label} needs hover, so a touch screen shows a drawer instead"
                : "On a touch screen the menu is always a drawer";
        return new MenuBehavior(mode, MenuPresentation.Hidden, null, true, NavigationMode.Drawer, note);
    }

    /// <summary>
    /// Answers the navigation mode after the shell changes: the shell's own default wins, and the author can change it afterwards.
    /// </summary>
    /// <param name="current">The mode in place, if any.</param>
    /// <param name="shellDefault">The new shell's declared default mode, if any.</param>
    /// <param name="shellName">The new shell's display name, for the message.</param>
    /// <returns>The mode after the switch.</returns>
    public static MenuModeChange ModeAfterShellSwitch(string? current, string? shellDefault, string shellName)
    {
        var before = Normalize(current) ?? DefaultNavigationMode;
        var declared = Normalize(shellDefault);
        if (declared is null || declared == before)
        {
            return new MenuModeChange(before, false, null);
        }

        var label = NavigationModes.First(candidate => candidate.Id == declared).Label;
        return new MenuModeChange(declared.Value, true, $"Menu mode set to {label} by {shellName}");
    }
}
