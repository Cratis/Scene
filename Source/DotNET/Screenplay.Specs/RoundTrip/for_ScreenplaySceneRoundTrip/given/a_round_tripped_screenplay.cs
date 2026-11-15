// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Screenplay.Reverse;
using Cratis.Screenplay;
using Cratis.Screenplay.Comparison;
using Cratis.Screenplay.Diagnostics;
using Cratis.Screenplay.Files;
using Cratis.Screenplay.Printing;
using Cratis.Screenplay.Syntax;

namespace Cratis.Scene.Screenplay.RoundTrip.for_ScreenplaySceneRoundTrip.given;

/// <summary>
/// A Screenplay source carried into Scene documents and back, and compared with what it started as.
/// </summary>
/// <remarks>
/// Equivalence is Screenplay decision 0013: two models are the same when their declarative constructs have the same canonical meaning, and what
/// a realization cannot recover is reported as an explicit loss rather than passing silently. A construct is compared by the Screenplay it prints
/// as, which is its canonical form; the placement of a screen in the slices of a board is not a construct of the documents, which hold screens by role.
/// </remarks>
public class a_round_tripped_screenplay : Specification
{
    static readonly ScreenplayPrinter _printer = new();

    protected ApplicationSyntax _original = null!;
    protected ApplicationSyntax _returned = null!;
    protected IReadOnlyList<ImportedScreenDocument> _documents = [];
    protected SceneDocumentApplicationPrint _printed = null!;

    protected void RoundTripSample(string name)
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !Directory.Exists(Path.Combine(directory.FullName, "Samples")))
        {
            directory = directory.Parent;
        }

        var compilation = new PlayFileCompiler().CompileFolder(Path.Combine(directory!.FullName, "Samples", name), new Identity());
        RoundTrip(compilation.Result.Value ?? throw new InvalidOperationException("The sample does not compile: " + string.Join("; ", compilation.Result.Diagnostics.Select(diagnostic => diagnostic.Message))));
    }

    protected void RoundTrip(string source)
    {
        var compilation = new ScreenplayCompiler().Parse(source);
        RoundTrip(compilation.Value ?? throw new InvalidOperationException("The source does not compile: " + string.Join("; ", compilation.Diagnostics.Select(diagnostic => diagnostic.Message))));
    }

    protected void RoundTrip(ApplicationSyntax application)
    {
        _original = application;
        _documents = SceneDocumentApplication.Read(_original);
        _printed = SceneDocumentApplication.Print(_documents.Select(document => new SceneModuleDocument(Guid.Empty, document.ActorId ?? document.RoleName ?? "UI", document.RoleName ?? "UI", document.Document)));
        var again = new ScreenplayCompiler().Parse(_printed.Source);
        _returned = again.Value ?? throw new InvalidOperationException("The printed source does not compile: " + string.Join("; ", again.Diagnostics.Select(diagnostic => diagnostic.Message)) + "\n" + _printed.Source);
    }

    protected static string Printed(params ScreenSyntax[] screens) =>
        _printer.Print(new ApplicationSyntax([], [], [], [new ModuleSyntax("M", [], [new FeatureSyntax("F", [], [new SliceSyntax(Cratis.Screenplay.Syntax.SliceType.StateView, "S", [], [], [], [], [], [], screens, [], [], SourceLocation.Start)], SourceLocation.Start)], SourceLocation.Start)], SourceLocation.Start));

    protected static string Printed(IEnumerable<LayoutSyntax>? layouts = null, IEnumerable<UiProfileSyntax>? profiles = null, IEnumerable<ThemeSyntax>? themes = null, IEnumerable<DesignSystemSyntax>? designSystems = null, IEnumerable<ShapeSyntax>? shapes = null, IEnumerable<ScreenSyntax>? screens = null) =>
        _printer.Print(new ApplicationSyntax([], [], [], [], SourceLocation.Start, UiProfiles: profiles?.ToArray(), Themes: themes?.ToArray(), Layouts: layouts?.ToArray())
        {
            DesignSystems = designSystems?.ToArray() ?? [],
            Shapes = shapes?.ToArray() ?? [],
            Screens = screens?.ToArray() ?? []
        });

    protected static IEnumerable<SliceSyntax> Slices(ApplicationSyntax application) =>
        application.Modules.SelectMany(module => Features(module.Features)).SelectMany(feature => feature.Slices);

    protected static ModelDifference Compare(string before, string after) =>
        ModelComparison.Compare(ComparedModel.FromSources("Application", new Dictionary<string, string> { ["application.play"] = before }), ComparedModel.FromSources("Application", new Dictionary<string, string> { ["application.play"] = after }));

    static IEnumerable<FeatureSyntax> Features(IEnumerable<FeatureSyntax> features) =>
        features.SelectMany(feature => new[] { feature }.Concat(Features(feature.Features)));

    sealed class Identity : IApplicationSyntaxVisitor<ApplicationSyntax>
    {
        public ApplicationSyntax Visit(ApplicationSyntax syntax) => syntax;
    }
}
