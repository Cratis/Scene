// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// The fonts an application can choose.
/// </summary>
public static class FontCatalog
{
    /// <summary>
    /// The id of the font that stands in for any font that is not available.
    /// </summary>
    public const string SystemFontId = "system-ui";

    /// <summary>
    /// The line every host shows under a font in a picker: digits and letters together, so fonts that differ in their numerals look different.
    /// </summary>
    public const string SampleLine = "Orders shipped this week: 1 284";

    /// <summary>
    /// Gets the fonts, in the order a picker lists them.
    /// </summary>
    public static readonly IReadOnlyList<FontChoice> Fonts =
    [
        new("inter", "Inter", "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif", FontSource.Hosted, "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap", "SIL Open Font License 1.1", "https://github.com/rsms/inter/blob/master/LICENSE.txt"),
        new("ibm-plex-sans", "IBM Plex Sans", "'IBM Plex Sans', system-ui, -apple-system, 'Segoe UI', sans-serif", FontSource.Hosted, "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap", "SIL Open Font License 1.1", "https://github.com/IBM/plex/blob/master/LICENSE.txt"),
        new("source-serif-4", "Source Serif 4", "'Source Serif 4', Georgia, 'Times New Roman', serif", FontSource.Hosted, "https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;600;700&display=swap", "SIL Open Font License 1.1", "https://github.com/adobe-fonts/source-serif/blob/main/LICENSE.md"),
        new(SystemFontId, "System UI", "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif", FontSource.System, null, "Provided by the operating system", null)
    ];

    /// <summary>
    /// Looks a font up by id.
    /// </summary>
    /// <param name="id">The font's id.</param>
    /// <returns>The font, or <see langword="null"/> when the catalog has none with that id.</returns>
    public static FontChoice? Find(string id) => Fonts.FirstOrDefault(font => font.Id == id);
}
