// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Icons;

/// <summary>
/// The persisted, renderer-neutral identity of one icon: which icon library it comes from, which icon
/// inside that library, and optionally which style variant of it. It carries no CSS class, no SVG and no
/// component - those belong to a renderer's adapter for the library.
/// </summary>
/// <remarks>
/// Identity is all three fields, which is exactly what record equality compares. A display name, a catalog
/// position or a CSS class is never identity: two libraries can each ship an icon called
/// <c language="csharp">home</c>, and they are different icons that are never silently swapped for one another.
/// </remarks>
/// <param name="Library">The identity of the icon library - the <see cref="Packages.ScenePackage.Name"/> of the <see cref="Packages.PackageKind.IconLibrary"/> package that provides the icon.</param>
/// <param name="Key">The stable key of the icon inside its library; not its display name.</param>
/// <param name="Variant">The style variant (<c language="csharp">outline</c>, <c language="csharp">solid</c> ...), or <see langword="null"/> when there is none.</param>
public record IconReference(string Library, string Key, string? Variant = null)
{
    const char Separator = '#';

    /// <summary>
    /// Whether the reference is well-formed: a non-empty library and key, a variant that is either absent or
    /// non-empty, and no part containing the text-form separator.
    /// </summary>
    /// <returns><see langword="true"/> when well-formed; otherwise <see langword="false"/>.</returns>
    public bool IsValid() => IsPart(Library) && IsPart(Key) && (Variant is null || IsPart(Variant));

    /// <summary>
    /// Reads the text form produced by <see cref="Format"/>.
    /// </summary>
    /// <param name="text">The text to read.</param>
    /// <param name="reference">The reference read, when the text is one.</param>
    /// <returns><see langword="true"/> when <paramref name="text"/> is a well-formed text form; otherwise <see langword="false"/>.</returns>
    public static bool TryParse(string text, out IconReference? reference)
    {
        reference = null;
        var parts = text.Split(Separator);
        if (parts.Length is < 2 or > 3 || !parts.All(IsPart))
        {
            return false;
        }

        reference = new IconReference(parts[0], parts[1], parts.Length == 3 ? parts[2] : null);
        return true;
    }

    /// <summary>
    /// The canonical single-string form, <c language="csharp">library#key</c> or
    /// <c language="csharp">library#key#variant</c>, for keys, logs and diagnostics. It is not the persisted shape.
    /// </summary>
    /// <returns>The text form.</returns>
    /// <exception cref="InvalidOperationException">The reference is not <see cref="IsValid"/>.</exception>
    public string Format() => IsValid()
        ? (Variant is null ? $"{Library}{Separator}{Key}" : $"{Library}{Separator}{Key}{Separator}{Variant}")
        : throw new InvalidOperationException($"'{Library}', '{Key}', '{Variant}' is not a valid icon reference: library and key are required, and no part may be empty or contain '{Separator}'");

    static bool IsPart(string? value) => !string.IsNullOrEmpty(value) && !value.Contains(Separator);
}
