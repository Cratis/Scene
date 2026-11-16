// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.DesignSystems;
using Cratis.Screenplay;
using ScreenplaySyntax = Cratis.Screenplay.Syntax;

namespace Cratis.Scene.Screenplay.DesignSystems.for_DesignSystemConverter.given;

/// <summary>
/// An application that declares a design system and the theme that implements it.
/// </summary>
public class a_compiled_design_system : Specification
{
    protected const string Source =
        """
        design system ShopDesign
          modes light, dark
          default theme Daylight

          tokens
            color
              surface    "page background"
              text       "body text"
              primary    "primary action"
              on-primary "text on a primary action"
            space
              md         "default gap between elements"
            radius
              control    "inputs and buttons"

          components
            Button
              parts text, background, radius
              variant primary
                text       = color.on-primary
                background = color.primary
                radius     = radius.control
                state disabled
                  text       = color.text
                  background = color.surface

          words
            voice
              tone = "Plain and exact"
            naming
              customer = "Client"

          rules
            contrast text on background at least 4.5

        theme Daylight
          implements ShopDesign

          palette
            indigo = "#4338CA"
            white  = "#FFFFFF"
            ink    = "#111827"

          values
            space.md       = "12px"
            radius.control = "8px"

          light
            color.surface    = palette.white
            color.text       = palette.ink
            color.primary    = palette.indigo
            color.on-primary = palette.white

          dark
            color.surface    = palette.ink
            color.text       = palette.white
            color.primary    = palette.indigo
            color.on-primary = palette.white
        """;

    protected ScreenplaySyntax.ApplicationSyntax _application = null!;
    protected DesignSystem? _designSystem;
    protected ConversionDiagnostics _diagnostics = new();

    protected DesignTheme Daylight => _designSystem!.Themes.Single();

    protected DesignThemeMode Mode(string mode) => Daylight.Modes.Single(candidate => candidate.Mode == mode);

    protected void Convert(string source, IReadOnlyDictionary<string, ComponentMapping>? mappings = null)
    {
        _application = new ScreenplayCompiler().Parse(source).Value!;
        _designSystem = DesignSystemConverter.Convert(_application, mappings, _diagnostics);
    }
}
