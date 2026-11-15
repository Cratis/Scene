// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Design.AI.DesignSystem;

namespace Cratis.Scene.Design.AI.given;

/// <summary>
/// Design systems as Screenplay, and the sources they are established from.
/// </summary>
public static class Brand
{
    public const string DesignSystem =
        """
        design system ShopDesign
          modes light, dark
          default theme Daylight

          tokens
            color
              surface    "page background"
              primary    "primary action"
              on-primary "text on a primary action"

          components
            Button
              parts text, background
              variant primary
                text       = color.on-primary
                background = color.primary

          rules
            contrast text on background at least 4.5

        theme Daylight
          implements ShopDesign

          palette
            indigo = "#4338CA"
            white  = "#FFFFFF"

          light
            color.surface    = palette.white
            color.primary    = palette.indigo
            color.on-primary = palette.white

          dark
            color.surface    = palette.indigo
            color.primary    = palette.white
            color.on-primary = palette.indigo
        """;

    // The theme gives no value for color.primary in dark mode.
    public static readonly string Incomplete = DesignSystem.Replace("    color.primary    = palette.white\n", string.Empty, StringComparison.Ordinal);

    // Valid, but white on a near white background breaks the contrast rule.
    public static readonly string LowContrast = DesignSystem.Replace("color.primary    = palette.indigo", "color.primary    = palette.white", StringComparison.Ordinal);

    public const string Stylesheet =
        """
        :root { --primary: #4338CA; --border: #D1D5DB; --radius: 8px; }
        .card { border: 1px solid #D2D6DC; border-radius: 6px; color: #4338CA; }
        .btn { background: #4439CB; border-radius: 8px; }
        """;

    public const string BrandNotes = "We speak plainly. We say invoice, never bill.";

    public static DesignSource File(string name, string content) => new(DesignSourceKind.File, "shop-web", name, content);
}
