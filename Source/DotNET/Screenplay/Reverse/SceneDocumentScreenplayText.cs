// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Screenplay.Diagnostics;
using Cratis.Screenplay.Printing;
using Cratis.Screenplay.Syntax;

namespace Cratis.Scene.Screenplay.Reverse;

/// <summary>
/// A Scene document - the one a screen or a screen template is saved as - as the Screenplay the export writes for it: the screens and forms with the layouts and
/// templates they sit in, printed as one application so it reads the way the export's file does.
/// </summary>
public static class SceneDocumentScreenplayText
{
    const string ModuleName = "Screens";

    static readonly ScreenplayPrinter _printer = new();

    /// <summary>
    /// The screens of a role's document, as the export writes them, and what the export could not say.
    /// </summary>
    public static (string Code, IReadOnlyList<string> Warnings) OfScreen(string role, string actorId, string document)
    {
        var export = SceneDocumentScreenplayBridge.Export(role, actorId, document);
        return Print(export.Screens, export.Forms, export.Declarations, export.Diagnostics);
    }

    /// <summary>
    /// What a screen template's document declares - the template, its slots and outlets - and any screen it holds.
    /// </summary>
    public static (string Code, IReadOnlyList<string> Warnings) OfTemplate(string document)
    {
        var root = SceneJson.Parse(SceneDocumentUpgrade.Upgrade(document));
        if (root is null)
        {
            return (string.Empty, ["The template's document is not a Scene document."]);
        }

        var gaps = new SceneTransportGaps();
        var (screens, forms, declarations) = SceneScreens.ToSyntax("Template", root, gaps);
        return Print(screens, forms, declarations, gaps.Messages);
    }

    static (string Code, IReadOnlyList<string> Warnings) Print(IReadOnlyList<ScreenSyntax> screens, IReadOnlyList<FormSyntax> forms, SceneDeclarationSet declarations, IReadOnlyList<string> diagnostics)
    {
        FeatureSyntax[] features = screens.Count == 0
            ? []
            : [new FeatureSyntax(ModuleName, [], [new SliceSyntax(Cratis.Screenplay.Syntax.SliceType.StateView, ModuleName, [], [], [], [], [], [], screens, [], [], SourceLocation.Start)], SourceLocation.Start)];
        var module = new ModuleSyntax(ModuleName, declarations.ScreenTemplates, features, SourceLocation.Start, Forms: forms, DialogTemplates: declarations.DialogTemplates);
        var application = new ApplicationSyntax([], [], [], [module], SourceLocation.Start, Layouts: declarations.Layouts.Count > 0 ? declarations.Layouts : null)
        {
            Exposures = declarations.Exposures,
            InstanceContributions = declarations.Instances
        };
        try
        {
            return (_printer.Print(application), diagnostics);
        }
        catch (UnsupportedSyntaxForPrinting unsupported)
        {
            return (string.Empty, [.. diagnostics, $"The Screenplay of the screen cannot be written: {unsupported.Message}"]);
        }
    }
}
