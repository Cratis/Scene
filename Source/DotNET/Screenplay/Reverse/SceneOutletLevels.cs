// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;
using Cratis.Screenplay;
using Cratis.Screenplay.Diagnostics;
using Cratis.Screenplay.Printing;
using Cratis.Screenplay.Syntax;

namespace Cratis.Scene.Screenplay.Reverse;

/// <summary>
/// How a feature refines the outlets it inherits - the Screenplay 6 `outlet &lt;name&gt; extends` written on the feature.
/// </summary>
sealed record SceneFeatureOutlets(string Feature, IReadOnlyList<OutletSyntax> Outlets);

/// <summary>
/// What a Scene document keeps as 'outletLevels': how the features and the screens of the application refine the outlets they inherit (StudioIssues#1330).
/// A module's refinements are the navigation's own and travel with it; a screen's are written on the screen (`outlet &lt;name&gt; extends`), a feature's on the feature,
/// exactly where Screenplay 6 reads them. The module and feature levels are the board's now, and a document no longer gets them: this reads what documents stored before
/// that hold. A level that declares outlets of its own or contributes to others, and a level of any other kind, is left to the preservation carrier - they have no such place.
/// </summary>
static class SceneOutletLevels
{
    public const string Member = "outletLevels";

    const string FeatureKind = "feature";
    const string ScreenKind = "screen";

    static readonly string[] _levelMembers = ["kind", "name", "refinements"];
    static readonly ScreenplayPrinter _printer = new();
    static readonly ScreenplayCompiler _compiler = new();

    /// <summary>
    /// Reads the levels a document states. What cannot be said as Screenplay is named in the gaps.
    /// </summary>
    public static Levels Read(JsonObject root, IReadOnlySet<string> navigationNames, SceneTransportGaps gaps)
    {
        if (SceneJson.Member(root, Member) is not { } node || SceneJson.IsEmpty(node))
        {
            return Levels.None;
        }

        if (node is not JsonArray levels)
        {
            gaps.Member("document", Member, "it is not a list");
            return Levels.None;
        }

        var screens = new Dictionary<string, IReadOnlyList<OutletSyntax>>(StringComparer.Ordinal);
        List<SceneFeatureOutlets> features = [];
        foreach (var level in levels.OfType<JsonObject>())
        {
            gaps.UnknownMembers(level, "outlet level", _levelMembers);
            var kind = SceneJson.String(level, "kind");
            var name = SceneJson.String(level, "name");
            if (kind is not (FeatureKind or ScreenKind))
            {
                gaps.Member("outlet level", "kind", "Screenplay says how a feature or a screen refines an outlet, and no other level");
                continue;
            }

            if (name is null || (kind == FeatureKind && !SceneJson.IsIdentifier(name)))
            {
                gaps.Member($"outlet level of a {kind}", "name", "a feature is named by a Screenplay name");
                continue;
            }

            var owner = $"outlet level of {kind} '{name}'";
            var outlets = SceneNavigation.LevelRefinements(level, owner, navigationNames, gaps);
            if (kind == ScreenKind)
            {
                if (!screens.TryAdd(name, outlets))
                {
                    gaps.Member(owner, "name", "a screen has one level of outlets");
                }
            }
            else if (features.Exists(known => known.Feature == name))
            {
                gaps.Member(owner, "name", "a feature has one level of outlets");
            }
            else
            {
                features.Add(new SceneFeatureOutlets(name, outlets));
            }
        }

        return new(screens, features);
    }

    /// <summary>
    /// The screens of the document that exist, so a level that names a screen the document does not transport is not lost without a word.
    /// </summary>
    public static void ScreensTransported(Levels levels, IEnumerable<string> transported, SceneTransportGaps gaps)
    {
        var known = transported.ToHashSet(StringComparer.Ordinal);
        foreach (var screen in levels.Screens.Keys.Where(name => !known.Contains(name)))
        {
            gaps.Member($"outlet level of screen '{screen}'", "name", "the screen it refines is not one the document transports");
        }
    }

    /// <summary>
    /// How the features of the documents refine outlets, put on the features of the application they name. These are what documents stored before the board kept the levels
    /// of the outlets (StudioIssues#1327) say; what a feature says on the board is what is in force, and an outlet it refines there is not written twice. The compiler's rules
    /// for outlets are asked, so a refinement it would refuse (an outlet no layout or template the feature can see declares) is left out with the reason rather than written
    /// into a document that does not compile.
    /// </summary>
    public static List<ModuleSyntax> ApplyTo(IReadOnlyList<SceneFeatureOutlets> levels, LayoutSyntax[] layouts, List<ModuleSyntax> modules, ScreenplayExportWarnings warnings)
    {
        if (levels.Count == 0)
        {
            return modules;
        }

        var known = modules.SelectMany(module => module.Features.SelectMany(NamesOf)).ToHashSet(StringComparer.Ordinal);
        foreach (var unknown in levels.Where(level => !known.Contains(level.Feature)))
        {
            warnings.Add($"Outlets: feature '{unknown.Feature}' is not a feature of the application, so how it refines outlets was not exported.");
        }

        var applied = modules.ConvertAll(module => module with { Features = [.. module.Features.Select(feature => With(feature, levels, warnings))] });
        if (Refusals(layouts, applied) is { Count: > 0 } refusals)
        {
            foreach (var refusal in refusals)
            {
                warnings.Add($"Outlets: {refusal} - how the features refine outlets was not exported.");
            }

            return modules;
        }

        return applied;
    }

    /// <summary>
    /// The levels of the screens and the features as a document keeps them.
    /// </summary>
    public static JsonArray ToJson(IEnumerable<(string Screen, IReadOnlyList<OutletSyntax> Outlets)> screens, IEnumerable<SceneFeatureOutlets> features, IReadOnlySet<string> navigationNames)
    {
        var levels = new JsonArray();
        foreach (var (screen, outlets) in screens.Where(level => level.Outlets.Count > 0))
        {
            levels.Add(Level(ScreenKind, screen, outlets, navigationNames));
        }

        foreach (var feature in features.Where(level => level.Outlets.Count > 0))
        {
            levels.Add(Level(FeatureKind, feature.Feature, feature.Outlets, navigationNames));
        }

        return levels;
    }

    /// <summary>
    /// The document with its levels set, or without the member at all when it has none.
    /// </summary>
    public static void Attach(JsonObject document, JsonArray levels)
    {
        if (levels.Count > 0)
        {
            document[Member] = levels;
        }
    }

    /// <summary>
    /// The levels a document already holds, with more.
    /// </summary>
    public static JsonArray Appended(JsonObject document, IEnumerable<SceneFeatureOutlets> features, IReadOnlySet<string> navigationNames)
    {
        var levels = SceneJson.Member(document, Member) is JsonArray existing ? (JsonArray)existing.DeepClone() : [];
        foreach (var feature in features.Where(level => level.Outlets.Count > 0))
        {
            levels.Add(Level(FeatureKind, feature.Feature, feature.Outlets, navigationNames));
        }

        return levels;
    }

    static IEnumerable<string> NamesOf(FeatureSyntax feature) => feature.Features.SelectMany(NamesOf).Prepend(feature.Name);

    static FeatureSyntax With(FeatureSyntax feature, IReadOnlyList<SceneFeatureOutlets> levels, ScreenplayExportWarnings warnings)
    {
        var refined = feature.Outlets;
        if (levels.FirstOrDefault(level => level.Feature == feature.Name) is { } own)
        {
            foreach (var outlet in own.Outlets)
            {
                if (refined.Any(declared => declared.Name == outlet.Name))
                {
                    warnings.Add($"Outlets: feature '{feature.Name}' already refines '{outlet.Name}' on the board, so how a screen of an older document refines it was not exported.");
                    continue;
                }

                refined = [.. refined, outlet];
            }
        }

        return feature with { Outlets = refined, Features = [.. feature.Features.Select(child => With(child, levels, warnings))] };
    }

    /// <summary>
    /// What the compiler refuses of the outlets the features refine, against the layouts and the outlets the templates declare. Only the outlets are asked about: what
    /// the templates and the features hold besides is left out, so nothing else can be refused.
    /// </summary>
    static IReadOnlyList<string> Refusals(LayoutSyntax[] layouts, List<ModuleSyntax> modules)
    {
        var skeleton = modules.Select(module => new ModuleSyntax(
            module.Name,
            [.. module.ScreenTemplates.Select(template => new ScreenTemplateSyntax(template.Name, template.Slots, SourceLocation.Start, template.FitsSlot) { Outlets = template.Outlets })],
            [.. module.Features.Select(Skeleton)],
            SourceLocation.Start)
        { Outlets = module.Outlets }).ToArray();
        var application = new ApplicationSyntax([], [], [], skeleton, SourceLocation.Start, Layouts: [.. layouts.Select(layout => layout with { Arrangement = null, Behaviors = [], UsedBehaviors = [], Exposes = [] })]);
        string text;
        try
        {
            text = _printer.Print(application);
        }
        catch (UnsupportedSyntaxForPrinting unsupported)
        {
            return [unsupported.Message];
        }

        return
        [
            .. _compiler.Compile(text).Diagnostics
                .Where(diagnostic => diagnostic.Severity == DiagnosticSeverity.Error && SceneNavigation.IsOutletCode(diagnostic.Code))
                .Select(diagnostic => $"{diagnostic.Code} {diagnostic.Message}")
        ];
    }

    static FeatureSyntax Skeleton(FeatureSyntax feature) =>
        new(feature.Name, [.. feature.Features.Select(Skeleton)], [], SourceLocation.Start) { Outlets = feature.Outlets };

    static JsonObject Level(string kind, string name, IReadOnlyList<OutletSyntax> outlets, IReadOnlySet<string> navigationNames) => new()
    {
        ["kind"] = kind,
        ["name"] = name,
        ["refinements"] = new JsonArray([.. outlets.Select(outlet => (JsonNode)SceneNavigation.Refinement(outlet, navigationNames))])
    };

    /// <summary>
    /// The levels a document states, as the Screenplay the screens and the features say them in.
    /// </summary>
    public sealed record Levels(IReadOnlyDictionary<string, IReadOnlyList<OutletSyntax>> Screens, IReadOnlyList<SceneFeatureOutlets> Features)
    {
        public static readonly Levels None = new(new Dictionary<string, IReadOnlyList<OutletSyntax>>(), []);

        public IReadOnlyList<OutletSyntax> ScreenOutlets(string sceneName) => Screens.TryGetValue(sceneName, out var outlets) ? outlets : [];
    }
}
