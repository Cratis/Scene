// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;
using Cratis.Screenplay;
using Cratis.Screenplay.Diagnostics;
using Cratis.Screenplay.Printing;
using Cratis.Screenplay.Syntax;

namespace Cratis.Scene.Screenplay.Reverse;

/// <summary>
/// Proves a typed transport by doing it: the screens and forms are printed, compiled and read back, and the document they
/// read back to must say what the original says. Whatever does not survive is named, so nothing is lost silently.
/// </summary>
static class SceneTransportVerification
{
    const string ModuleName = "SceneTransport";

    static readonly ScreenplayPrinter _printer = new();
    static readonly ScreenplayCompiler _compiler = new();

    public static bool Compiles(IReadOnlyList<ScreenSyntax> screens, IReadOnlyList<FormSyntax> forms, SceneDeclarationSet declarations, SceneTransportGaps gaps) =>
        Reopen(screens, forms, declarations, gaps) is not null;

    public static void RoundTrip(string role, JsonObject source, IReadOnlyList<ScreenSyntax> screens, IReadOnlyList<FormSyntax> forms, SceneDeclarationSet declarations, SceneTransportGaps gaps, bool verbatim = false)
    {
        if (Reopen(screens, forms, declarations, gaps) is not { } reopened)
        {
            return;
        }

        // The navigation is not part of what a skeleton module carries - it names the application's modules - and is proven on its own.
        var withoutNavigation = (JsonObject)source.DeepClone();
        withoutNavigation.Remove(SceneNavigation.Member);
        var document = SceneScreens.ToJson(role, reopened.Screens, reopened.Forms, reopened.Declarations, [], verbatim);

        // An outlet of navigation a layout declares reads back as the navigation it opens, which is proven on its own too.
        document.Remove(SceneNavigation.Member);
        if (verbatim)
        {
            document.Remove(SceneNative.Member);
        }

        if (SceneDocumentCanonicalForm.FirstDifference(withoutNavigation, document) is { } difference)
        {
            gaps.Add($"Scene document member '{difference}' does not survive the typed Screenplay round trip.");
        }
    }

    static IEnumerable<ToolbarButtonSyntax> ButtonsOf(OutletItemSyntax item) => item switch
    {
        ToolbarButtonSyntax button => [button],
        OutletGroupSyntax group => group.Buttons,
        _ => []
    };

    /// <summary>
    /// The buttons of the toolbars a screen places, wherever it places them: in a template's slot, a section or a component's slot.
    /// </summary>
    static IEnumerable<ToolbarButtonSyntax> ToolbarButtonsIn(IEnumerable<ScreenDirectiveSyntax> directives) =>
        directives.SelectMany(directive => directive switch
        {
            ScreenToolbarSyntax toolbar => toolbar.Buttons,
            ScreenTemplateReferenceSyntax template => template.Slots.SelectMany(slot => ToolbarButtonsIn(slot.Directives)),
            ScreenSlotSyntax slot => ToolbarButtonsIn(slot.Directives),
            ScreenSectionSyntax section => ToolbarButtonsIn(section.Directives),
            ScreenComponentSyntax component => component.Slots.SelectMany(slot => ToolbarButtonsIn(slot.Directives)),
            _ => []
        });

    /// <summary>
    /// The one slice a skeleton text declares, or null when it declares none or several.
    /// </summary>
    static SliceSyntax? ReadSlice(string text) =>
        new ScreenplayCompiler().Parse(text, "Source") is { Value: { } application } &&
        application.Modules.SingleOrDefault()?.Features.SingleOrDefault()?.Slices.SingleOrDefault() is { } slice
            ? slice
            : null;

    /// <summary>
    /// A hook names the State Change slice it starts, which the skeleton does not otherwise have: it declares each one, with a command that takes its identifier from
    /// the item or the screen and, when a hook opens it, a screen to open.
    /// </summary>
    static IEnumerable<ModuleSyntax> HookedModules(IEnumerable<ScreenSyntax> screens, SceneDeclarationSet declarations)
    {
        var outlets = screens.SelectMany(screen => screen.Outlets).Concat(declarations.FeatureOutlets.SelectMany(level => level.Outlets));
        var toolbars = screens.SelectMany(screen => ToolbarButtonsIn(screen.Directives));
        var buttons = outlets.SelectMany(outlet => outlet.Items).SelectMany(ButtonsOf).Concat(toolbars).Where(button => button.Slice is not null);

        return buttons.GroupBy(button => button.Slice!, StringComparer.Ordinal).Select(hooks =>
        {
            var path = hooks.Key.Split('.');
            var name = path[^1];
            var feature = path.Length > 1 ? path[^2] : "Hooks";
            var module = path.Length > 2 ? path[^3] : "Hooked";
            var screen = hooks.Any(hook => hook.Opens != HookOpening.Runs) ? $"      screen {name}\n        title \"{name}\"\n" : string.Empty;
            var text = $"module Source\n  feature Source\n    slice StateChange {name}\n      command {name}\n        id Uuid identifier\n        produces {name}Done\n          for id\n      event {name}Done\n        id Uuid\n{screen}";
            return (Module: module, Feature: feature, Slice: ReadSlice(text));
        }).Where(hook => hook.Slice is not null).GroupBy(hook => hook.Module, StringComparer.Ordinal).Select(modules => new ModuleSyntax(
            modules.Key,
            [],
            [.. modules.GroupBy(hook => hook.Feature, StringComparer.Ordinal).Select(features => new FeatureSyntax(features.Key, [], [.. features.Select(hook => hook.Slice!)], SourceLocation.Start))],
            SourceLocation.Start));
    }

    static (IEnumerable<ScreenSyntax> Screens, IEnumerable<FormSyntax> Forms, SceneDeclarationSet Declarations)? Reopen(IReadOnlyList<ScreenSyntax> screens, IReadOnlyList<FormSyntax> forms, SceneDeclarationSet declarations, SceneTransportGaps gaps)
    {
        // A picker chooses from a query the application declares, so the skeleton declares the ones the forms choose from.
        var pickerQueries = forms.SelectMany(form => form.Fields).Select(field => field.Choices?.Query).OfType<string>().Select(query => query.Split('.')[^1]).Distinct(StringComparer.Ordinal)
            .Select(query => new QuerySyntax(query, new TypeRefSyntax($"{query}Row", true, false, SourceLocation.Start), null, [], null, SourceLocation.Start)).ToArray();
        var slice = new SliceSyntax(Cratis.Screenplay.Syntax.SliceType.StateView, "Screens", [], [], pickerQueries, [], [], [], screens, [], [], SourceLocation.Start);
        var feature = new FeatureSyntax("Screens", [], [slice], SourceLocation.Start);

        // How the document's features refine outlets is proven where it is written: on features of that name, beside the one the screens are in.
        var levels = declarations.FeatureOutlets.Select(level => new FeatureSyntax(level.Feature, [], [], SourceLocation.Start) { Outlets = level.Outlets });
        var module = new ModuleSyntax(ModuleName, declarations.ScreenTemplates, [feature, .. levels], SourceLocation.Start, Forms: forms, DialogTemplates: declarations.DialogTemplates);
        var application = new ApplicationSyntax([], [], [], [module, .. HookedModules(screens, declarations)], SourceLocation.Start, Layouts: declarations.Layouts.Count > 0 ? declarations.Layouts : null)
        {
            Exposures = declarations.Exposures,
            InstanceContributions = declarations.Instances
        };
        string source;
        try
        {
            source = _printer.Print(application);
        }
        catch (UnsupportedSyntaxForPrinting unsupported)
        {
            gaps.Add($"Scene document cannot be written as typed Screenplay: {unsupported.Message}");
            return null;
        }

        var compilation = _compiler.Compile(source);
        if (compilation is not { Success: true, Value: { } compiled })
        {
            var error = compilation.Diagnostics.FirstOrDefault(diagnostic => diagnostic.Severity == DiagnosticSeverity.Error);
            gaps.Add($"Scene document does not compile as typed Screenplay: {error?.Message ?? "the compiler refused it"}.");
            return null;
        }

        var reopened = compiled.Modules.Single(candidate => string.Equals(candidate.Name, ModuleName, StringComparison.Ordinal));
        return (reopened.Features.Single(candidate => candidate.Slices.Any()).Slices.Single().Screens, reopened.Forms ?? [], SceneDeclarationSet.Of(compiled, reopened));
    }
}
