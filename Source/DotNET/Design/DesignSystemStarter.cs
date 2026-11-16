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
/// for a host that works on the design system alone. The names derive from the one name the host gives: design system is
/// <c language="text">{name}Design</c> and the theme is <c language="text">{name}</c>.
/// </para>
/// <para>
/// The roles, components and values are those of the default design system (<c language="text">blueprint.default</c>), which a shared fixture
/// (<c language="text">default-design-system-fixture.json</c>) asserts in both engines, so the starter cannot drift from the look every Scene application had.
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
    /// <param name="name">The name of the product or application; the design system is <c language="text">{name}Design</c> and its theme <c language="text">{name}</c>. Anything that is not a letter or digit is left out.</param>
    /// <returns>The Screenplay text.</returns>
    public static string Create(string name = DefaultName)
    {
        var identifier = Identify(name);
        return Load("layouts") + "\n" + Load("profile", identifier) + "\n" + Load("design-system", identifier);
    }

    /// <summary>
    /// Creates the starter's design system and its theme alone.
    /// </summary>
    /// <param name="name">The name of the product or application; the design system is <c language="text">{name}Design</c> and its theme <c language="text">{name}</c>. Anything that is not a letter or digit is left out.</param>
    /// <returns>The Screenplay text.</returns>
    public static string CreateDesignSystem(string name = DefaultName) => Load("design-system", Identify(name));

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

    static string Load(string resource, string name = DefaultName)
    {
        using var stream = typeof(DesignSystemStarter).Assembly.GetManifestResourceStream($"Starter/{resource}.play")
            ?? throw new InvalidOperationException($"There is no starter resource named '{resource}'.");
        using var reader = new StreamReader(stream);
        return reader.ReadToEnd().Replace("\r\n", "\n", StringComparison.Ordinal).Replace("{name}", name, StringComparison.Ordinal);
    }
}
