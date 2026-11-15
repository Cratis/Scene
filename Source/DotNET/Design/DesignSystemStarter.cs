// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text;

namespace Cratis.Scene.Design;

/// <summary>
/// The design system a product starts from when it has none: Scene's default design system written as Screenplay - the token roles, the shell
/// and foundation components and a theme with a light and a dark mode - so a product that starts from it looks like the default, and then makes it its own.
/// </summary>
/// <remarks>
/// <para>
/// <see cref="Create(string)"/> gives the whole starter: the design system, its theme, an application shell, the five page patterns (sheet, master-detail,
/// settings page, empty state and dialog) and a profile that uses them. <see cref="CreateDesignSystem(string)"/> gives only the design system and its theme,
/// for a host that works on the design system alone. The names derive from the one name the host gives: <c language="text">design system</c> is
/// <c>{name}Design</c> and the theme is <c>{name}</c>.
/// </para>
/// <para>
/// The roles, components and values are those of the default design system (<c>blueprint.default</c>), which a shared fixture
/// (<c>default-design-system-fixture.json</c>) asserts in both engines, so the starter cannot drift from the look every Scene application had.
/// </para>
/// </remarks>
public static class DesignSystemStarter
{
    /// <summary>
    /// The name a starter is given when the host gives none.
    /// </summary>
    public const string DefaultName = "Product";

    /// <summary>
    /// Gets the starter for the default name: the design system, its theme, the shell, the page patterns and the profile.
    /// </summary>
    public static readonly string Screenplay = Create();

    /// <summary>
    /// Gets the starter's design system and theme for the default name.
    /// </summary>
    public static readonly string DesignSystemScreenplay = CreateDesignSystem();

    /// <summary>
    /// Creates the whole starter: the shell, the page patterns, the profile, the design system and its theme.
    /// </summary>
    /// <param name="name">The name of the product or application; the design system is <c>{name}Design</c> and its theme <c>{name}</c>. Anything that is not a letter or digit is left out.</param>
    /// <returns>The Screenplay text.</returns>
    public static string Create(string name = DefaultName)
    {
        var identifier = Identify(name);
        return Layouts + Environment.NewLine + Profile(identifier) + Environment.NewLine + DesignSystemText(identifier);
    }

    /// <summary>
    /// Creates the starter's design system and its theme alone.
    /// </summary>
    /// <param name="name">The name of the product or application; the design system is <c>{name}Design</c> and its theme <c>{name}</c>. Anything that is not a letter or digit is left out.</param>
    /// <returns>The Screenplay text.</returns>
    public static string CreateDesignSystem(string name = DefaultName) => DesignSystemText(Identify(name));

    /// <summary>
    /// Gets the name of the design system a starter declares for a name.
    /// </summary>
    /// <param name="name">The name of the product or application.</param>
    /// <returns>The name of the design system.</returns>
    public static string DesignSystemName(string name = DefaultName) => $"{Identify(name)}Design";

    /// <summary>
    /// Gets the name of the theme a starter declares for a name.
    /// </summary>
    /// <param name="name">The name of the product or application.</param>
    /// <returns>The name of the theme.</returns>
    public static string ThemeName(string name = DefaultName) => Identify(name);

    static string Identify(string name)
    {
        var builder = new StringBuilder();
        var upper = true;
        foreach (var character in name ?? string.Empty)
        {
            if (!char.IsAsciiLetterOrDigit(character))
            {
                upper = true;
                continue;
            }

            builder.Append(upper ? char.ToUpperInvariant(character) : character);
            upper = false;
        }

        var identifier = builder.ToString();
        return identifier.Length == 0 || char.IsAsciiDigit(identifier[0]) ? $"{DefaultName}{identifier}" : identifier;
    }

    static string Profile(string name) => $"""
        ui profile Desktop
          target platform web
          target size regular
          root template AppShell

          new screens use template Sheet

          packages
            Cratis.Components

          theme {name}

        """;

    static string DesignSystemText(string name) => $"""
        design system {name}Design
          modes light, dark
          default theme {name}

          tokens
            color
              primary "brand accent, active states, primary buttons"
              on-primary "text and icons on the primary color"
              background "the page canvas behind everything"
              surface "topbar, sidebar, cards, panels"
              border "every divider and outline"
              hover "hover states on menu items and buttons"
              overlay "floating submenus and popups"
              text "body text"
              text-muted "secondary text, footer, section titles"
              highlight "the current menu item's background"
              on-highlight "the current menu item's text"
              success "text of a good outcome: a positive trend, an approved step"
              success-surface "the tinted background behind success"
              warning "text of something needing attention: a partial load, a pending approval"
              warning-surface "the tinted background behind a warning"
              danger "text of a problem: an error, a negative trend, a rejection"
              danger-surface "the tinted background behind a problem"
              info "text of neutral information"
              info-surface "the tinted background behind information"
            radius
              content "every rounded corner"
            shadow
              focus-ring "the keyboard focus indicator"
            font
              sans "the font of the whole application"

          components
            Shell
              parts background, text, font
              variant default
                background = color.background
                text = color.text
                font = font.sans
            Page
              parts background, text, font
              variant default
                background = color.background
                text = color.text
                font = font.sans
            Topbar
              parts background, text, border
              variant default
                background = color.surface
                text = color.text
                border = color.border
            Sidebar
              parts background, text, border
              variant default
                background = color.surface
                text = color.text
                border = color.border
              variant primary
                background = color.primary
                text = color.on-primary
                border = color.primary
            Menu
              parts background, text, border, radius
              variant default
                background = color.surface
                text = color.text
                border = color.border
                radius = radius.content
                state hover
                  background = color.hover
                state selected
                  background = color.highlight
                  text = color.on-highlight
            Popover
              parts background, text, border, radius
              variant default
                background = color.overlay
                text = color.text
                border = color.border
                radius = radius.content
                state hover
                  background = color.hover
                state selected
                  background = color.highlight
                  text = color.on-highlight
            Footer
              parts background, text
              variant default
                background = color.background
                text = color.text-muted
            Text
              parts text, font
              variant default
                text = color.text
                font = font.sans
              variant muted
                text = color.text-muted
                font = font.sans
            Card
              parts background, text, border, radius
              variant default
                background = color.surface
                text = color.text
                border = color.border
                radius = radius.content
            Button
              parts background, text, border, radius, shadow
              variant primary
                background = color.primary
                text = color.on-primary
                border = color.primary
                radius = radius.content
                state focus
                  shadow = shadow.focus-ring
            Input
              parts background, text, border, radius, shadow
              variant default
                background = color.surface
                text = color.text
                border = color.border
                radius = radius.content
                state focus
                  border = color.primary
                  shadow = shadow.focus-ring
            StatusChip
              parts text, background
              variant success
                text = color.success
                background = color.success-surface
              variant warning
                text = color.warning
                background = color.warning-surface
              variant danger
                text = color.danger
                background = color.danger-surface
              variant info
                text = color.info
                background = color.info-surface

          rules
            contrast text on background at least 4.5

        theme {name}
          implements {name}Design
          compatible with Cratis.Components

          palette
            indigo = "#4f46e5"
            white = "#ffffff"
            canvas = "#f4f5f7"
            hairline = "#e2e5e9"
            mist = "#eceef1"
            ink = "#1f2430"
            slate = "#5b6472"
            tint = "#eef2ff"
            deepIndigo = "#3730a3"
            indigoRing = "0 0 0 2px rgb(79 70 229 / 0.4)"
            green = "#166534"
            mint = "#dcfce7"
            amber = "#854d0e"
            sand = "#fef3c7"
            red = "#991b1b"
            blush = "#fee2e2"
            blue = "#1e40af"
            sky = "#dbeafe"
            periwinkle = "#818cf8"
            night = "#10131f"
            abyss = "#0f1117"
            coal = "#171a23"
            edge = "#262a36"
            lift = "#1f2431"
            panel = "#1c2030"
            frost = "#e6e8ef"
            fog = "#9aa1b1"
            dusk = "#232a45"
            lavender = "#c7ccff"
            periwinkleRing = "0 0 0 2px rgb(129 140 248 / 0.45)"
            lime = "#86efac"
            forest = "#14301f"
            gold = "#fcd34d"
            bronze = "#33290f"
            rose = "#fca5a5"
            wine = "#3a1616"
            ice = "#93c5fd"
            deepBlue = "#162a4a"

          values
            radius.content = "0.5rem"
            font.sans = "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"

          light
            color.primary = palette.indigo
            color.on-primary = palette.white
            color.background = palette.canvas
            color.surface = palette.white
            color.border = palette.hairline
            color.hover = palette.mist
            color.overlay = palette.white
            color.text = palette.ink
            color.text-muted = palette.slate
            color.highlight = palette.tint
            color.on-highlight = palette.deepIndigo
            shadow.focus-ring = palette.indigoRing
            color.success = palette.green
            color.success-surface = palette.mint
            color.warning = palette.amber
            color.warning-surface = palette.sand
            color.danger = palette.red
            color.danger-surface = palette.blush
            color.info = palette.blue
            color.info-surface = palette.sky

          dark
            color.primary = palette.periwinkle
            color.on-primary = palette.night
            color.background = palette.abyss
            color.surface = palette.coal
            color.border = palette.edge
            color.hover = palette.lift
            color.overlay = palette.panel
            color.text = palette.frost
            color.text-muted = palette.fog
            color.highlight = palette.dusk
            color.on-highlight = palette.lavender
            shadow.focus-ring = palette.periwinkleRing
            color.success = palette.lime
            color.success-surface = palette.forest
            color.warning = palette.gold
            color.warning-surface = palette.bronze
            color.danger = palette.rose
            color.danger-surface = palette.wine
            color.info = palette.ice
            color.info-surface = palette.deepBlue
        """;

    const string Layouts = """
        layout AppShell
          category application
          topbar
          sidebar
          content
          footer

        module Workspaces
          screen template Sheet
            category Page
            scopes feature
            content

          screen template MasterDetail
            category Page
            scopes feature
            sidebar
            main

          screen template SettingsPage
            category Page
            scopes feature
            sections

          screen template EmptyState
            category Page
            scopes feature
            content

          dialog template Dialog
            category Dialog
            body
            actions

        """;
}
