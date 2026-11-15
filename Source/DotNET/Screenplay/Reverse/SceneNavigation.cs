// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;
using Cratis.Screenplay;
using Cratis.Screenplay.Diagnostics;
using Cratis.Screenplay.Printing;
using Cratis.Screenplay.Syntax;

namespace Cratis.Scene.Screenplay.Reverse;

/// <summary>
/// The navigation of a module: the outlets of the application's navigation it inherits, extends or overrides.
/// </summary>
sealed record SceneModuleNavigation(string Module, IReadOnlyList<OutletSyntax> Outlets);

/// <summary>
/// The navigation a Scene document carries as its 'navigation' member (Scene 5): the application's outlets of navigation - the topbar
/// and the sidebar - and the outlets of actions beside them, with the logo, and for each module how it refines them. It is the
/// Screenplay 6 `outlet &lt;name&gt; of navigation` declarations of the application's layout and the outlet refinements of its modules,
/// so what the designer authors exports and imports.
/// </summary>
sealed record SceneNavigationDeclaration(IReadOnlyList<OutletSyntax> Outlets, NavigationLogoSyntax? Logo, IReadOnlyList<SceneModuleNavigation> Modules)
{
    public bool IsEmpty => Outlets.Count == 0 && Logo is null && Modules.All(module => module.Outlets.Count == 0);

    public IReadOnlyList<OutletSyntax> OutletsOf(string module) =>
        [.. Modules.Where(candidate => string.Equals(candidate.Module, module, StringComparison.Ordinal)).SelectMany(candidate => candidate.Outlets)];

    /// <summary>
    /// The application's outlets with the logo on the one that holds it: the topbar, or the first outlet of navigation when there is none.
    /// </summary>
    public IReadOnlyList<OutletSyntax> ApplicationOutlets()
    {
        var navigation = Outlets.Where(outlet => outlet.Kind == OutletKind.Navigation).ToArray();
        if (Logo is null || navigation.Length == 0)
        {
            return Outlets;
        }

        var holder = Array.Find(navigation, outlet => outlet.Name == SceneNavigation.Topbar) ?? navigation[0];
        return [.. Outlets.Select(outlet => ReferenceEquals(outlet, holder) ? outlet with { Logo = Logo } : outlet)];
    }
}

static class SceneNavigation
{
    public const string Member = "navigation";
    public const string Topbar = "topbar";

    /// <summary>
    /// Scene names the buttons beside a navigation outlet '&lt;outlet&gt;Buttons'; Screenplay names them '&lt;outlet&gt;Actions'.
    /// </summary>
    const string ScreenplayButtonsSuffix = "Actions";
    const string SceneButtonsSuffix = "Buttons";
    const string Placeholder = "Navigation";
    const string Navigation = "navigation";
    const string Actions = "actions";
    const string Inherits = "inherits";
    const string Extends = "extends";
    const string Overrides = "overrides";

    static readonly string[] _modelMembers = ["application", "modules"];
    static readonly string[] _applicationMembers = ["outlets", "logo"];
    static readonly string[] _moduleMembers = ["module", "refinements", "contributions"];
    static readonly string[] _outletMembers = ["name", "kind", "defaults", "slot"];
    static readonly string[] _refinementMembers = ["outlet", "mode", "items", "hide"];
    static readonly string[] _logoMembers = ["image", "title"];
    static readonly ScreenplayPrinter _printer = new();
    static readonly ScreenplayCompiler _compiler = new();

    /// <summary>
    /// The navigation a document carries, or nothing when it carries none. What typed Screenplay cannot say, and what does not
    /// survive being written and read as Screenplay text, is named in the gaps, so the document is kept exactly rather than
    /// losing it.
    /// </summary>
    public static SceneNavigationDeclaration? ToSyntax(JsonObject root, SceneTransportGaps gaps)
    {
        if (SceneJson.Member(root, Member) is not { } node || SceneJson.IsEmpty(node))
        {
            return null;
        }

        if (node is not JsonObject model)
        {
            gaps.Member("document", Member, "it is not an object");
            return null;
        }

        gaps.UnknownMembers(model, "navigation", _modelMembers);
        var application = SceneJson.Object(model, "application") ?? [];
        gaps.UnknownMembers(application, "navigation application", _applicationMembers);
        var navigationNames = SceneJson.Array(application, "outlets").OfType<JsonObject>()
            .Where(outlet => SceneJson.String(outlet, "kind") == Navigation)
            .Select(outlet => SceneJson.String(outlet, "name"))
            .OfType<string>()
            .ToHashSet(StringComparer.Ordinal);
        var outlets = Declarations(application, navigationNames, gaps);
        var logo = Logo(SceneJson.Object(application, "logo"), gaps);
        List<SceneModuleNavigation> modules = [];
        foreach (var module in SceneJson.Array(model, "modules").OfType<JsonObject>())
        {
            gaps.UnknownMembers(module, "navigation module", _moduleMembers);
            if (SceneJson.String(module, "module") is not { } name || !SceneJson.IsIdentifier(name))
            {
                gaps.Member("navigation module", "module", "a module is named by a Screenplay name");
                continue;
            }

            if (modules.Exists(known => known.Module == name))
            {
                gaps.Member("navigation module", name, "a module's navigation is declared once");
                continue;
            }

            if (!SceneJson.IsEmpty(module["contributions"]))
            {
                gaps.Member($"navigation module '{name}'", "contributions", "Studio does not carry a module's navigation contributions into Screenplay yet");
            }

            modules.Add(new SceneModuleNavigation(name, Refinements(module, name, navigationNames, gaps)));
        }

        if (logo is not null && navigationNames.Count == 0)
        {
            gaps.Member("navigation application", "logo", "the logo is written in an outlet of navigation and the application declares none");
        }

        var declaration = new SceneNavigationDeclaration(outlets, logo, [.. modules.Where(module => module.Outlets.Count > 0)]);
        if (gaps.Any)
        {
            return declaration;
        }

        if (ReadBack(declaration) is not { } read)
        {
            gaps.Add("Scene navigation cannot be written as typed Screenplay outlets of navigation.");
        }
        else if (SceneDocumentCanonicalForm.FirstDifference(new JsonObject { [Member] = WithoutEmptyModules(model) }, new JsonObject { [Member] = ToJson(read) }) is { } difference)
        {
            gaps.Add($"Scene navigation member '{difference}' does not survive the typed Screenplay round trip.");
        }

        return declaration;
    }

    /// <summary>
    /// The navigation a Scene document holds, from the application's outlets, logo and modules.
    /// </summary>
    public static JsonObject ToJson(SceneNavigationDeclaration navigation)
    {
        var navigationNames = NavigationNames(navigation.Outlets);
        var application = new JsonObject
        {
            ["outlets"] = new JsonArray([.. navigation.Outlets.Select(outlet => (JsonNode)Declaration(outlet, navigationNames))])
        };
        if (navigation.Logo is { } logo)
        {
            application["logo"] = new JsonObject { ["image"] = logo.Image, ["title"] = logo.Title };
        }

        return new JsonObject
        {
            ["application"] = application,
            ["modules"] = new JsonArray([.. navigation.Modules.Select(module => (JsonNode)new JsonObject
            {
                ["module"] = module.Module,
                ["refinements"] = new JsonArray([.. module.Outlets.Select(outlet => (JsonNode)Refinement(outlet, navigationNames))])
            })])
        };
    }

    /// <summary>
    /// What a Screenplay application declares: the outlets of navigation, and the buttons beside them, of the layout the stage shells
    /// every screen in - the first one - and how each module refines them.
    /// </summary>
    public static SceneNavigationDeclaration? Of(ApplicationSyntax application)
    {
        var layout = (application.Layouts ?? []).FirstOrDefault();
        var layoutOutlets = layout?.Outlets.ToArray() ?? [];
        var navigationNames = NavigationNames(layoutOutlets);
        var outlets = layoutOutlets.Where(outlet => IsNavigationOutlet(outlet, navigationNames)).ToArray();
        var logo = outlets.Select(outlet => outlet.Logo).FirstOrDefault(candidate => candidate is not null);
        var modules = application.Modules
            .Select(module => new SceneModuleNavigation(module.Name, [.. module.Outlets.Where(outlet => outlet.Kind is null && IsNavigation(outlet.Name, navigationNames))]))
            .Where(module => module.Outlets.Count > 0)
            .ToArray();
        var declaration = new SceneNavigationDeclaration([.. outlets.Select(outlet => outlet with { Logo = null })], logo, modules);
        return declaration.IsEmpty ? null : declaration;
    }

    /// <summary>
    /// The names of the outlets of navigation a Scene document's navigation declares.
    /// </summary>
    public static IReadOnlySet<string> NavigationNamesOf(JsonObject root) =>
        SceneJson.Array(SceneJson.Object(SceneJson.Object(root, Member), "application"), "outlets").OfType<JsonObject>()
            .Where(outlet => SceneJson.String(outlet, "kind") == Navigation)
            .Select(outlet => SceneJson.String(outlet, "name"))
            .OfType<string>()
            .ToHashSet(StringComparer.Ordinal);

    /// <summary>
    /// The names of a layout's outlets of navigation.
    /// </summary>
    public static IReadOnlySet<string> NavigationNames(IEnumerable<OutletSyntax> outlets) =>
        outlets.Where(outlet => outlet.Kind == OutletKind.Navigation).Select(outlet => outlet.Name).ToHashSet(StringComparer.Ordinal);

    /// <summary>
    /// Whether a layout's outlet is part of the application's navigation: an outlet of navigation, or the outlet of actions beside one.
    /// </summary>
    public static bool IsNavigationOutlet(OutletSyntax outlet, IReadOnlySet<string> navigationNames) =>
        outlet.Kind == OutletKind.Navigation || (outlet.Kind == OutletKind.Actions && IsNavigation(outlet.Name, navigationNames));

    /// <summary>
    /// Whether the navigation written as Screenplay compiles against the layouts and modules it is put on: the compiler's rules for
    /// outlets of navigation are the rules of the designer, so they are asked rather than repeated. Returns what the compiler
    /// refused, none when the navigation can be written. An application with several domains is exported one event model at a time, and its navigation names the
    /// modules of the others (StudioIssues#894): when other event models may be targeted, an item that targets a module this one does not declare is written.
    /// </summary>
    public static IReadOnlyList<string> Refusals(IEnumerable<LayoutSyntax> layouts, IEnumerable<ModuleSyntax> modules, bool otherEventModelsMayBeTargeted = false)
    {
        var skeleton = modules.Select(module => new ModuleSyntax(module.Name, [], [.. module.Features.Select(Skeleton)], SourceLocation.Start) { Outlets = module.Outlets }).ToArray();
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
                .Where(diagnostic => diagnostic.Severity == DiagnosticSeverity.Error && IsNavigationCode(diagnostic.Code) &&
                    !(otherEventModelsMayBeTargeted && diagnostic.Code == "PLAY0748" && diagnostic.Message.Contains("targets module '", StringComparison.Ordinal)))
                .Select(diagnostic => $"{diagnostic.Code} {diagnostic.Message}")
        ];
    }

    /// <summary>
    /// The outlets with only what a document that declares just these modules can state: an item that targets another module (and the items under it) and a
    /// button that invokes a slice of another module are left out. A preview and a Play of one event model draw the navigation of the modules that event model
    /// has; the navigation as a whole - every domain - is kept in the documents (StudioIssues#894).
    /// </summary>
    public static IReadOnlyList<OutletSyntax> WithoutTargetsOutside(IEnumerable<OutletSyntax> outlets, ISet<string> modules) =>
        [.. outlets.Select(outlet => outlet with { Items = [.. outlet.Items.Select(item => WithoutTargetsOutside(item, modules)).OfType<OutletItemSyntax>()] })];

    /// <summary>
    /// A module that refines nothing says nothing: Scene's upgrader leaves one behind when all a stored module did was inherit.
    /// </summary>
    public static JsonNode? WithoutEmptyModules(JsonNode? navigation) => navigation is JsonObject model ? WithoutEmptyModules(model) : navigation;

    /// <summary>
    /// The navigation the documents state goes on the layout the stage shells every screen in - the first - and on the modules that
    /// declare their own. The compiler's rules for it are asked, so navigation it would refuse (a target the application does not
    /// declare, a slot no layout has) is left out with the reason rather than written into a document that does not compile.
    /// </summary>
    public static (LayoutSyntax[] Layouts, List<ModuleSyntax> Modules) OnApplication(SceneNavigationDeclaration? navigation, LayoutSyntax[] layouts, List<ModuleSyntax> modules, ScreenplayExportWarnings warnings, bool otherEventModelsMayBeTargeted = false)
    {
        if (navigation is not { IsEmpty: false })
        {
            return (layouts, modules);
        }

        if (layouts.Length == 0)
        {
            warnings.Add("Navigation: the application declares no layout to put the navigation regions on, so they were not exported.");
            return (layouts, modules);
        }

        var names = modules.Select(module => module.Name).ToHashSet(StringComparer.Ordinal);
        foreach (var unknown in navigation.Modules.Where(module => !names.Contains(module.Module)))
        {
            warnings.Add($"Navigation: module '{unknown.Module}' is not a module of the application, so its navigation regions were not exported.");
        }

        // For Stage - a preview or a Play of the modules of one event model - only the navigation to the modules it has is written; the rest stays in the documents.
        var applicationOutlets = otherEventModelsMayBeTargeted ? navigation.ApplicationOutlets() : SceneNavigation.WithoutTargetsOutside(navigation.ApplicationOutlets(), names);
        var carried = layouts.Select((layout, index) => index == 0
            ? layout with { Outlets = [.. layout.Outlets.Where(outlet => applicationOutlets.All(declared => declared.Name != outlet.Name)), .. applicationOutlets] }
            : layout).ToArray();
        var navigated = modules.ConvertAll(module => module with
        {
            Outlets = [.. module.Outlets.Where(outlet => navigation.OutletsOf(module.Name).All(refined => refined.Name != outlet.Name)), .. navigation.OutletsOf(module.Name)]
        });
        if (SceneNavigation.Refusals(carried, navigated, otherEventModelsMayBeTargeted) is { Count: > 0 } refusals)
        {
            foreach (var refusal in refusals)
            {
                warnings.Add($"Navigation: {refusal} - the navigation regions were not exported.");
            }

            return (layouts, modules);
        }

        return (carried, navigated);
    }

    internal static bool IsOutletCode(string code) => IsNavigationCode(code);

    internal static bool IsNavigation(string name, IReadOnlySet<string> navigationNames) =>
        navigationNames.Contains(name) || (BaseOf(name, ScreenplayButtonsSuffix) is { } region && navigationNames.Contains(region));

    /// <summary>
    /// The outlets a level refines, as the level's JSON states them: a module's refinements of the navigation, and the refinements of a feature or a screen.
    /// </summary>
    internal static List<OutletSyntax> LevelRefinements(JsonObject level, string owner, IReadOnlySet<string> navigationNames, SceneTransportGaps gaps)
    {
        List<OutletSyntax> outlets = [];
        foreach (var refinement in SceneJson.Array(level, "refinements").OfType<JsonObject>())
        {
            if (SceneJson.String(refinement, "outlet") is not { } outlet || !SceneJson.IsIdentifier(outlet))
            {
                gaps.Member(owner, "refinements", "a refinement names the outlet it refines");
                continue;
            }

            var description = $"{owner} outlet '{outlet}'";
            gaps.UnknownMembers(refinement, description, _refinementMembers);
            var screenplayName = ScreenplayName(outlet, navigationNames);
            if (outlets.Exists(known => known.Name == screenplayName))
            {
                gaps.Member(owner, outlet, "a level refines an outlet once");
                continue;
            }

            var mode = SceneJson.Index(SceneJson.Member(refinement, "mode"), [Inherits, Extends, Overrides]) switch
            {
                0 => OutletMode.Inherit,
                1 => OutletMode.Extend,
                2 => OutletMode.Override,
                _ => OutletMode.Unspecified
            };
            if (mode == OutletMode.Unspecified)
            {
                gaps.Member(description, "mode", "a module inherits, extends or overrides an outlet");
            }

            List<OutletHideSyntax> hides = [];
            foreach (var hide in SceneJson.Array(refinement, "hide"))
            {
                if (hide is JsonValue value && value.TryGetValue<string>(out var id) && SceneJson.IsIdentifier(id))
                {
                    hides.Add(new OutletHideSyntax(id, SourceLocation.Start));
                }
                else
                {
                    gaps.Member(description, "hide", "a hidden item is named by a Screenplay name");
                }
            }

            var items = SceneOutletItems.ToSyntax(SceneJson.Array(refinement, "items"), description, gaps);
            outlets.Add(new OutletSyntax(screenplayName, null, mode, items, SourceLocation.Start) { Hides = hides });
        }

        return outlets;
    }

    internal static JsonObject Refinement(OutletSyntax outlet, IReadOnlySet<string> navigationNames)
    {
        var json = new JsonObject
        {
            ["outlet"] = SceneName(outlet.Name, navigationNames),
            ["mode"] = outlet.Mode switch
            {
                OutletMode.Inherit => Inherits,
                OutletMode.Override => Overrides,
                _ => Extends
            }
        };

        // Scene's upgrader writes a refinement's items even when there are none, so a stored document reads back the same.
        json["items"] = SceneOutletItems.ToJson(outlet.Items);
        if (outlet.Hides.Any())
        {
            json["hide"] = new JsonArray([.. outlet.Hides.Select(hide => (JsonNode?)JsonValue.Create(hide.Id))]);
        }

        return json;
    }

    static OutletItemSyntax? WithoutTargetsOutside(OutletItemSyntax item, ISet<string> modules) => item switch
    {
        NavigationItemSyntax { Target: { } target } when !modules.Contains(target.Module) => null,
        NavigationItemSyntax navigation => navigation with { Children = [.. navigation.Children.Select(child => WithoutTargetsOutside(child, modules)).OfType<NavigationItemSyntax>()] },
        ToolbarButtonSyntax { Slice: { } slice } when !modules.Contains(slice.Split('.')[0]) => null,
        OutletGroupSyntax group => group with { Buttons = [.. group.Buttons.Where(button => button.Slice is null || modules.Contains(button.Slice.Split('.')[0]))] },
        _ => item
    };

    static string? BaseOf(string name, string suffix) =>
        name.Length > suffix.Length && name.EndsWith(suffix, StringComparison.Ordinal) ? name[..^suffix.Length] : null;

    static string ScreenplayName(string sceneName, IReadOnlySet<string> navigationNames) =>
        BaseOf(sceneName, SceneButtonsSuffix) is { } region && navigationNames.Contains(region) ? region + ScreenplayButtonsSuffix : sceneName;

    static string SceneName(string screenplayName, IReadOnlySet<string> navigationNames) =>
        BaseOf(screenplayName, ScreenplayButtonsSuffix) is { } region && navigationNames.Contains(region) ? region + SceneButtonsSuffix : screenplayName;

    static JsonObject WithoutEmptyModules(JsonObject model)
    {
        var clone = (JsonObject)model.DeepClone();
        if (clone["modules"] is JsonArray modules)
        {
            foreach (var empty in modules.OfType<JsonObject>().Where(module => SceneJson.Array(module, "refinements").Count == 0 && SceneJson.Array(module, "contributions").Count == 0).ToArray())
            {
                modules.Remove(empty);
            }
        }

        return clone;
    }

    static FeatureSyntax Skeleton(FeatureSyntax feature) =>
        new(feature.Name, [.. feature.Features.Select(Skeleton)], [], SourceLocation.Start);

    static bool IsNavigationCode(string code) =>
        code.StartsWith("PLAY0", StringComparison.Ordinal) && int.TryParse(code.AsSpan(4), out var number) && number is (>= 740 and <= 752) or (>= 897 and <= 905);

    static List<OutletSyntax> Declarations(JsonObject application, IReadOnlySet<string> navigationNames, SceneTransportGaps gaps)
    {
        List<OutletSyntax> outlets = [];
        foreach (var outlet in SceneJson.Array(application, "outlets").OfType<JsonObject>())
        {
            if (SceneJson.String(outlet, "name") is not { } name || !SceneJson.IsIdentifier(name))
            {
                gaps.Member("navigation application", "outlets", "every outlet is named by a Screenplay name");
                continue;
            }

            var description = $"navigation outlet '{name}'";
            gaps.UnknownMembers(outlet, description, _outletMembers);
            var kind = SceneJson.String(outlet, "kind") switch
            {
                Navigation => OutletKind.Navigation,
                Actions => OutletKind.Actions,
                _ => (OutletKind?)null
            };
            if (kind is null)
            {
                gaps.Member(description, "kind", "the application's navigation holds outlets of navigation and of actions");
                continue;
            }

            var screenplayName = ScreenplayName(name, navigationNames);
            if (outlets.Exists(known => known.Name == screenplayName))
            {
                gaps.Member("navigation application", name, "an outlet is declared once");
                continue;
            }

            var items = SceneOutletItems.ToSyntax(SceneJson.Array(outlet, "defaults"), description, gaps, asDefaults: true);
            outlets.Add(new OutletSyntax(screenplayName, kind, OutletMode.Unspecified, items, SourceLocation.Start) { Slot = SceneJson.String(outlet, "slot") });
        }

        return outlets;
    }

    static List<OutletSyntax> Refinements(JsonObject module, string name, IReadOnlySet<string> navigationNames, SceneTransportGaps gaps) =>
        LevelRefinements(module, $"navigation module '{name}'", navigationNames, gaps);

    static NavigationLogoSyntax? Logo(JsonObject? logo, SceneTransportGaps gaps)
    {
        if (logo is null || logo.Count == 0)
        {
            return null;
        }

        gaps.UnknownMembers(logo, "navigation logo", _logoMembers);
        if (SceneJson.String(logo, "image") is not { } image || SceneJson.String(logo, "title") is not { } title || SceneOutletItems.Unquotable(image) || SceneOutletItems.Unquotable(title))
        {
            gaps.Member("navigation application", "logo", "a logo is an image path and a one-line title without quotes");
            return null;
        }

        return new NavigationLogoSyntax(image, title, SourceLocation.Start);
    }

    static JsonObject Declaration(OutletSyntax outlet, IReadOnlySet<string> navigationNames)
    {
        var json = new JsonObject
        {
            ["name"] = SceneName(outlet.Name, navigationNames),
            ["kind"] = outlet.Kind == OutletKind.Navigation ? Navigation : Actions,
            ["defaults"] = SceneOutletItems.ToJson(outlet.Items)
        };
        SceneValues.Optional(json, "slot", outlet.Slot);
        return json;
    }

    /// <summary>
    /// The navigation written as Screenplay text and read again, which is what an export and an import do to it.
    /// </summary>
    static SceneNavigationDeclaration? ReadBack(SceneNavigationDeclaration navigation)
    {
        var layout = new LayoutSyntax(Placeholder, [], SourceLocation.Start) { Outlets = navigation.ApplicationOutlets() };
        var modules = navigation.Modules.Where(module => module.Outlets.Count > 0)
            .Select(module => new ModuleSyntax(module.Module, [], [], SourceLocation.Start) { Outlets = module.Outlets })
            .ToArray();
        string text;
        try
        {
            text = _printer.Print(new ApplicationSyntax([], [], [], modules, SourceLocation.Start, Layouts: [layout]));
        }
        catch (UnsupportedSyntaxForPrinting)
        {
            return null;
        }

        if (_compiler.Parse(text, Placeholder) is not { Value: { } application })
        {
            return null;
        }

        return Of(application) ?? new SceneNavigationDeclaration([], null, []);
    }
}
