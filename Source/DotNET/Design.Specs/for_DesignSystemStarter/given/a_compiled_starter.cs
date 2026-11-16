// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.DesignSystems;
using Cratis.Scene.Screenplay;
using Cratis.Scene.Screenplay.DesignSystems;
using Cratis.Screenplay;
using ScreenplaySyntax = Cratis.Screenplay.Syntax;

namespace Cratis.Scene.Design.for_DesignSystemStarter.given;

/// <summary>
/// A starter, compiled by Screenplay and converted to the design system Scene resolves.
/// </summary>
public class a_compiled_starter : Specification
{
    protected ScreenplaySyntax.ApplicationSyntax? _application;
    protected IReadOnlyList<string> _compilerDiagnostics = [];
    protected ConversionDiagnostics _conversion = new();
    protected DesignSystem? _designSystem;

    protected IEnumerable<string> Problems => _designSystem!.Themes.SelectMany(theme => theme.Modes.SelectMany(mode => mode.Problems ?? []));

    protected void Compile(string text)
    {
        var compilation = new ScreenplayCompiler().Compile(text);
        _compilerDiagnostics = [.. compilation.Diagnostics.Select(diagnostic => $"{diagnostic.Code}: {diagnostic.Message} (line {diagnostic.Location.Line})")];
        _application = compilation.Value;
        _designSystem = _application is null ? null : DesignSystemConverter.Convert(_application, null, _conversion);
    }
}
