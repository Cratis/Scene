// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;
using Cratis.Screenplay;
using Cratis.Screenplay.Diagnostics;
using Cratis.Screenplay.Printing;
using Cratis.Screenplay.Syntax;

namespace Cratis.Scene.Screenplay.Reverse;

/// <summary>
/// What a typed Scene document cannot say, kept as the Screenplay text it came from so an export can say it again. A screen
/// document is built from components, sections, actions, behaviors and one template reference, so the rest of what a
/// Screenplay screen holds - data, tables, titles, summaries, toolbars, guarded actions and the interactions on them - has no
/// Scene element. It travels in a 'native' member of the container it sits in (a screen's slot, a section's or a component's
/// outlet), together with the position among the typed elements it had, so it moves, stays and goes with the element that
/// holds it. The ui profiles, themes, behaviors and template assignments the application declares, the parts of layouts and
/// templates a Scene declaration has no member for, and the forms no screen reaches, travel in the same member of the document
/// root. The Scene editor deep-copies every document it edits, so a member it does not know survives its edits.
/// </summary>
public static class SceneNative
{
    /// <summary>
    /// The member a document keeps what typed Scene cannot say in.
    /// </summary>
    public const string Member = "native";

    const string Placeholder = "Native";
    const string ApplicationMember = "application";
    const string ModuleMember = "module";
    const string SliceMember = "slice";
    const string SlotsMember = "slots";
    const string ContributionsMember = "contributions";
    const string ScreenSlot = "$screen";
    const string TemplateMember = "template";
    const string VerbatimNamesMember = "verbatimNames";
    const int Indent = 2;

    static readonly ScreenplayPrinter _printer = new();
    static readonly ScreenplayCompiler _compiler = new();

    /// <summary>
    /// The directives a typed Scene element or screen carries itself; behaviors are carried by their owner.
    /// </summary>
    public static bool IsTyped(ScreenDirectiveSyntax directive) =>
        directive is ScreenComponentSyntax or ScreenSectionSyntax or ScreenActionSyntax || SceneCoreDirectives.IsElement(directive);

    public static bool IsCarriedElsewhere(ScreenDirectiveSyntax directive) => directive is ScreenBehaviorSyntax;

    /// <summary>
    /// The directives of one container that no Scene element can hold, each with the number of typed elements before it.
    /// </summary>
    public static JsonArray Capture(IEnumerable<ScreenDirectiveSyntax> directives, Func<ScreenDirectiveSyntax, bool>? isTyped = null, Func<ScreenDirectiveSyntax, bool>? isCarriedElsewhere = null, SceneScreenNames? names = null)
    {
        isTyped ??= IsTyped;
        isCarriedElsewhere ??= IsCarriedElsewhere;
        JsonArray entries = [];
        var typed = 0;
        foreach (var directive in directives)
        {
            if (isTyped(directive))
            {
                typed++;
            }
            else if (!isCarriedElsewhere(directive) && PrintDirectives([InScene(directive, names)], []) is { } text)
            {
                entries.Add(new JsonObject { ["at"] = typed, ["text"] = text });
            }
        }

        return entries;
    }

    /// <summary>
    /// Puts what a container kept natively back among its typed directives, each at the position it had.
    /// </summary>
    public static IReadOnlyList<ScreenDirectiveSyntax> Weave(IReadOnlyList<ScreenDirectiveSyntax> typed, JsonNode? entries, SceneElementScope scope)
    {
        if (!scope.IncludeNative || entries is not JsonArray array || array.Count == 0)
        {
            return typed;
        }

        List<ScreenDirectiveSyntax> result = [];
        var natives = array.OfType<JsonObject>()
            .Select(entry => (At: SceneJson.Integer(entry["at"]) ?? int.MaxValue, Directives: ParseDirectives(SceneJson.String(entry, "text"))))
            .Where(entry => entry.Directives is not null)
            .ToArray();
        for (var index = 0; index <= typed.Count; index++)
        {
            foreach (var native in natives.Where(native => Math.Min(native.At, typed.Count) == index))
            {
                result.AddRange(native.Directives!.Value.Item1.Select(directive => InScreenplay(directive, scope.Names)));
            }

            if (index < typed.Count)
            {
                result.Add(typed[index]);
            }
        }

        return result;
    }

    /// <summary>
    /// Records a container's native directives on the element that owns it, under the container's name.
    /// </summary>
    public static void Attach(JsonObject owner, string container, JsonArray entries)
    {
        if (entries.Count == 0)
        {
            return;
        }

        var native = owner[Member] as JsonObject ?? [];
        native[container] = entries;
        owner[Member] = native;
    }

    /// <summary>
    /// The native entries a container (a screen slot, a section or a component outlet) of the owner holds.
    /// </summary>
    public static JsonNode? Of(JsonObject owner, string container) => SceneJson.Object(owner, Member)?[container];

    /// <summary>
    /// A screen's natives: its top-level directives beside a template reference, each template slot or its content slot,
    /// and the contributions a screen document holds no element for.
    /// </summary>
    public static void AttachScreen(JsonObject screen, JsonArray topLevel, IReadOnlyDictionary<string, JsonArray> slots, JsonArray contributions)
    {
        var native = new JsonObject();
        if (topLevel.Count > 0)
        {
            native[ScreenSlot] = topLevel;
        }

        var slotNatives = new JsonObject(slots.Where(slot => slot.Value.Count > 0).Select(slot => KeyValuePair.Create(slot.Key, (JsonNode?)slot.Value)));
        if (slotNatives.Count > 0)
        {
            native[SlotsMember] = slotNatives;
        }

        if (contributions.Count > 0)
        {
            native[ContributionsMember] = contributions;
        }

        if (native.Count > 0)
        {
            screen[Member] = native;
        }
    }

    /// <summary>
    /// The blueprint package and the version range a screen's template reference names: a Scene screen names its template and no
    /// more, so what `template blueprint &lt;Blueprint&gt; &lt;Name&gt; version "&lt;range&gt;"` says beyond the name is kept beside it.
    /// </summary>
    public static void AttachTemplateReference(JsonObject screen, string? blueprint, string? version)
    {
        if (blueprint is null && version is null)
        {
            return;
        }

        var native = screen[Member] as JsonObject ?? [];
        var reference = new JsonObject();
        if (blueprint is not null)
        {
            reference["blueprint"] = blueprint;
        }

        if (version is not null)
        {
            reference["version"] = version;
        }

        native[TemplateMember] = reference;
        screen[Member] = native;
    }

    public static (string? Blueprint, string? Version) TemplateReferenceOf(JsonObject screen, SceneElementScope scope) =>
        scope.IncludeNative && SceneJson.Object(SceneJson.Object(screen, Member), TemplateMember) is { } reference
            ? (SceneJson.String(reference, "blueprint"), SceneJson.String(reference, "version"))
            : (null, null);

    public static JsonNode? ScreenTopLevel(JsonObject screen) => Of(screen, ScreenSlot);

    public static JsonNode? ScreenSlotOf(JsonObject screen, string slot) => SceneJson.Object(SceneJson.Object(screen, Member), SlotsMember)?[slot];

    public static JsonArray CaptureContributions(IEnumerable<ScreenContributionSyntax> contributions) =>
        [.. contributions.Select(PrintContribution).OfType<JsonNode>()];

    public static IEnumerable<ScreenContributionSyntax> Contributions(JsonObject screen, SceneElementScope scope) =>
        !scope.IncludeNative || SceneJson.Array(SceneJson.Object(screen, Member), ContributionsMember) is not { Count: > 0 } entries
            ? []
            : entries.OfType<JsonObject>()
                .Select(entry => ParseDirectives(SceneJson.String(entry, "text"))?.Item2)
                .OfType<IReadOnlyList<ScreenContributionSyntax>>()
                .SelectMany(contribution => contribution);

    /// <summary>
    /// The document without any native member, which is what the typed round trip is proven against.
    /// </summary>
    public static JsonObject Stripped(JsonObject document)
    {
        var clone = (JsonObject)document.DeepClone();
        Strip(clone);
        return clone;
    }

    /// <summary>
    /// The document without what the application and the module kept natively: that is read from every document of the
    /// application together, so a single document is not expected to read it back on its own.
    /// </summary>
    public static JsonNode? WithoutResidue(JsonNode? document)
    {
        if (document is JsonObject json)
        {
            json.Remove(Member);
        }

        return document;
    }

    /// <summary>
    /// What the application and the module of a typed screen declare that a screen document has no member for.
    /// </summary>
    public static void AttachResidue(JsonObject document, SceneDeclarationSet declarations)
    {
        var native = new JsonObject();
        if (declarations.Application is { Length: > 0 } application)
        {
            native[ApplicationMember] = application;
        }

        if (declarations.Module is { Length: > 0 } module)
        {
            native[ModuleMember] = module;
        }

        if (native.Count > 0)
        {
            document[Member] = native;
        }
    }

    /// <summary>
    /// The application-level part of what a typed screen's application declares and a screen document holds no member for.
    /// </summary>
    public static string? ApplicationResidue(ApplicationSyntax application)
    {
        var layouts = (application.Layouts ?? []).Where(layout => layout.Name != SceneDocumentCanonicalForm.StudioLayoutName && (SceneArrangements.IsLossy(layout.Arrangement) || layout.Behaviors.Any() || layout.UsedBehaviors.Any() || layout.Exposes.Any())).ToArray();
        var profiles = (application.UiProfiles ?? []).ToArray();
        var themes = (application.Themes ?? []).ToArray();

        // A theme names the design system it implements, so the design system is kept with it: without it the theme does not compile.
        var designSystems = application.DesignSystems.ToArray();
        var behaviors = application.Behaviors.ToArray();
        var templates = application.Templates.ToArray();
        var concepts = application.Concepts.ToArray();
        var types = (application.Types ?? []).ToArray();
        var sampleDataPacks = application.SampleDataPacks.ToArray();
        if (layouts.Length + profiles.Length + themes.Length + designSystems.Length + behaviors.Length + templates.Length + concepts.Length + types.Length + sampleDataPacks.Length == 0)
        {
            return null;
        }

        return Print(new ApplicationSyntax([], concepts, [], [], SourceLocation.Start, UiProfiles: profiles, Themes: themes, Layouts: layouts)
        {
            Behaviors = behaviors,
            Templates = templates,
            Types = types,
            SampleDataPacks = sampleDataPacks,
            DesignSystems = designSystems
        });
    }

    /// <summary>
    /// The module-level part: the declarations a Scene declaration has no member for, the forms no screen reaches and the
    /// contributions, behaviors and template assignments the module declares.
    /// </summary>
    public static string? ModuleResidue(ModuleSyntax module, IEnumerable<FormSyntax> unreachedForms)
    {
        var screenTemplates = module.ScreenTemplates.Where(template => SceneArrangements.IsLossy(template.Arrangement) || template.Behaviors.Any() || template.UsedBehaviors.Any() || template.Exposes.Any()).Select(template => template with { Content = [] }).ToArray();
        var dialogTemplates = (module.DialogTemplates ?? []).Where(template => SceneArrangements.IsLossy(template.Arrangement) || template.Behaviors.Any() || template.UsedBehaviors.Any() || template.Exposes.Any()).Select(template => template with { Content = [] }).ToArray();
        var forms = unreachedForms.ToArray();
        var contributions = (module.Contributions ?? []).ToArray();
        var behaviors = module.Behaviors.ToArray();
        var used = module.UsedBehaviors.ToArray();
        var templates = module.Templates.ToArray();
        var features = FeatureResidue(module.Features).ToArray();
        if (screenTemplates.Length + dialogTemplates.Length + forms.Length + contributions.Length + behaviors.Length + used.Length + templates.Length + features.Length == 0)
        {
            return null;
        }

        var residue = module with
        {
            ScreenTemplates = screenTemplates,
            DialogTemplates = dialogTemplates,
            Forms = forms,
            Contributions = contributions,
            Behaviors = behaviors,
            UsedBehaviors = used,
            Templates = templates,
            Features = features
        };
        return Print(new ApplicationSyntax([], [], [], [residue], SourceLocation.Start));
    }

    /// <summary>
    /// Everything the documents kept natively, read back once for the application: the same declaration kept by several
    /// documents is one.
    /// </summary>
    public static NativeResidue ResidueOf(IEnumerable<JsonObject> documents)
    {
        var roots = documents.ToArray();
        var applications = Texts(roots, ApplicationMember).Select(Parse).OfType<ApplicationSyntax>().ToArray();
        var modules = Texts(roots, ModuleMember).Select(Parse).OfType<ApplicationSyntax>().SelectMany(application => application.Modules).ToArray();
        return new NativeResidue(applications, modules);
    }

    /// <summary>
    /// What a slice declares that the board rebuilds on its own and a screen depends on by name: the queries its screens read.
    /// </summary>
    public static string? SliceResidue(SliceSyntax slice)
    {
        if (!slice.Queries.Any())
        {
            return null;
        }

        var carrier = new SliceSyntax(Cratis.Screenplay.Syntax.SliceType.StateView, Placeholder, [], [], [.. slice.Queries], [], [], [], [], [], [], SourceLocation.Start);
        var module = new ModuleSyntax(Placeholder, [], [new FeatureSyntax(Placeholder, [], [carrier], SourceLocation.Start)], SourceLocation.Start);
        return Print(new ApplicationSyntax([], [], [], [module], SourceLocation.Start)) is { } text ? Body(text, $"slice StateView {Placeholder}") : null;
    }

    /// <summary>
    /// The names of a document whose screens keep the names they were written with, rather than being named after the role the document belongs to; null
    /// for any other document. The document stores the Scene name of each screen beside the name it was written with; one stored before that says only
    /// that the names are the ones written.
    /// </summary>
    public static SceneScreenNames? VerbatimNamesOf(JsonObject root, IEnumerable<string> sceneScreens)
    {
        if (SceneJson.Object(root, Member) is not { } native)
        {
            return null;
        }

        if (native[VerbatimNamesMember] is JsonObject pairs)
        {
            return SceneScreenNames.FromPairs(pairs.Select(pair => KeyValuePair.Create(pair.Key, pair.Value is JsonValue value && value.TryGetValue<string>(out var written) ? written : pair.Key)));
        }

        return native[VerbatimNamesMember] is JsonValue flag && flag.TryGetValue<bool>(out var verbatim) && verbatim
            ? SceneScreenNames.FromPairs(sceneScreens.Distinct(StringComparer.Ordinal).Select(scene => KeyValuePair.Create(scene, scene)))
            : null;
    }

    public static void AttachVerbatimNames(JsonObject document, SceneScreenNames names)
    {
        var native = document[Member] as JsonObject ?? [];
        native[VerbatimNamesMember] = new JsonObject(names.Pairs.Select(pair => KeyValuePair.Create(pair.Key, (JsonNode?)JsonValue.Create(pair.Value))));
        document[Member] = native;
    }

    public static void AttachSlice(JsonObject document, string? residue)
    {
        if (string.IsNullOrWhiteSpace(residue))
        {
            return;
        }

        var native = document[Member] as JsonObject ?? [];
        native[SliceMember] = residue;
        document[Member] = native;
    }

    /// <summary>
    /// The queries a document kept from the slice it was read on.
    /// </summary>
    public static IReadOnlyList<QuerySyntax> Queries(string document)
    {
        if (SceneJson.Parse(document) is not { } root || SceneJson.String(SceneJson.Object(root, Member), SliceMember) is not { Length: > 0 } text)
        {
            return [];
        }

        var body = string.Join('\n', text.Split('\n').Select(line => line.Length == 0 ? line : new string(' ', (3 * Indent) + Indent) + line));
        var source = $"module {Placeholder}\n  feature {Placeholder}\n    slice StateView {Placeholder}\n{body}\n";
        return Parse(source)?.Modules.SingleOrDefault()?.Features.SingleOrDefault()?.Slices.SingleOrDefault() is { } slice ? [.. slice.Queries] : [];
    }

    /// <summary>
    /// Whether a component of the given name is used anywhere in the directives, through component slots, sections and template slots.
    /// </summary>
    public static bool Uses(IEnumerable<ScreenDirectiveSyntax> directives, string component) =>
        directives.Any(directive => directive switch
        {
            ScreenComponentSyntax used => used.Component == component || Uses(used.Slots.SelectMany(slot => slot.Directives), component),
            ScreenSectionSyntax section => Uses(section.Directives, component),
            ScreenTemplateReferenceSyntax template => Uses(template.Slots.SelectMany(slot => slot.Directives), component),
            _ => false
        });

    public static bool Uses(ScreenSyntax screen, string component) =>
        Uses(screen.Directives, component) || screen.Contributions.Any(contribution => Uses(contribution.Directives, component));

    /// <summary>
    /// The features that declare contributions, behaviors or template assignments, as bare features: the board rebuilds the
    /// features and their slices, and these are what it cannot say.
    /// </summary>
    static IEnumerable<FeatureSyntax> FeatureResidue(IEnumerable<FeatureSyntax> features)
    {
        foreach (var feature in features)
        {
            var nested = FeatureResidue(feature.Features).ToArray();
            var contributions = (feature.Contributions ?? []).ToArray();
            var behaviors = feature.Behaviors.ToArray();
            var used = feature.UsedBehaviors.ToArray();
            var templates = feature.Templates.ToArray();
            if (contributions.Length + behaviors.Length + used.Length + templates.Length + nested.Length > 0)
            {
                yield return feature with
                {
                    Features = nested,
                    Slices = [],
                    Contributions = contributions,
                    Behaviors = behaviors,
                    UsedBehaviors = used,
                    Templates = templates
                };
            }
        }
    }

    /// <summary>
    /// A slot that shows another screen names it as the editor does - by its Scene name - and Screenplay by the name the screen has there.
    /// </summary>
    static ScreenDirectiveSyntax InScene(ScreenDirectiveSyntax directive, SceneScreenNames? names) =>
        directive is ScreenShowSyntax show && names is not null ? show with { Screen = names.ToScene(show.Screen) } : directive;

    static ScreenDirectiveSyntax InScreenplay(ScreenDirectiveSyntax directive, SceneScreenNames names) =>
        directive is ScreenShowSyntax show ? show with { Screen = names.ToScreenplay(show.Screen) } : directive;

    static IEnumerable<string> Texts(IEnumerable<JsonObject> roots, string member) =>
        roots.Select(root => SceneJson.String(SceneJson.Object(root, Member), member)).OfType<string>().Where(text => text.Length > 0).Distinct(StringComparer.Ordinal);

    static void Strip(JsonNode? node)
    {
        switch (node)
        {
            case JsonObject json:
                json.Remove(Member);
                foreach (var member in json.ToArray())
                {
                    Strip(member.Value);
                }

                break;
            case JsonArray array:
                foreach (var item in array)
                {
                    Strip(item);
                }

                break;
        }
    }

    static JsonObject? PrintContribution(ScreenContributionSyntax contribution) =>
        PrintDirectives([], [contribution]) is { } text ? new JsonObject { ["text"] = text } : null;

    /// <summary>
    /// One directive, or one contribution, printed the way a screen holds it.
    /// </summary>
    static string? PrintDirectives(IReadOnlyList<ScreenDirectiveSyntax> directives, IReadOnlyList<ScreenContributionSyntax> contributions)
    {
        var screen = new ScreenSyntax(Placeholder, null, directives, SourceLocation.Start) { Contributions = contributions };
        var slice = new SliceSyntax(Cratis.Screenplay.Syntax.SliceType.StateView, Placeholder, [], [], [], [], [], [], [screen], [], [], SourceLocation.Start);
        var feature = new FeatureSyntax(Placeholder, [], [slice], SourceLocation.Start);
        var module = new ModuleSyntax(Placeholder, [], [feature], SourceLocation.Start);
        if (Print(new ApplicationSyntax([], [], [], [module], SourceLocation.Start)) is not { } text)
        {
            return null;
        }

        return Body(text, $"screen {Placeholder}");
    }

    /// <summary>
    /// The lines a printed declaration holds below its header, one level out.
    /// </summary>
    static string? Body(string text, string headerText)
    {
        var lines = text.Replace("\r\n", "\n", StringComparison.Ordinal).Split('\n');
        var header = Array.FindIndex(lines, line => line.Trim() == headerText);
        if (header < 0)
        {
            return null;
        }

        var indent = lines[header].Length - lines[header].TrimStart().Length;
        var body = lines.Skip(header + 1).TakeWhile(line => line.Trim().Length == 0 || line.Length - line.TrimStart().Length > indent).ToArray();
        return string.Join('\n', body.Select(line => line.Length >= indent + Indent ? line[(indent + Indent)..] : line.TrimStart()).ToArray()).TrimEnd();
    }

    /// <summary>
    /// The directives and contributions of a text printed by PrintDirectives.
    /// </summary>
    static (IReadOnlyList<ScreenDirectiveSyntax>, IReadOnlyList<ScreenContributionSyntax>)? ParseDirectives(string? text)
    {
        if (string.IsNullOrWhiteSpace(text))
        {
            return null;
        }

        var body = string.Join('\n', text.Split('\n').Select(line => line.Length == 0 ? line : new string(' ', (4 * Indent) + Indent) + line));
        var source = $"module {Placeholder}\n  feature {Placeholder}\n    slice StateView {Placeholder}\n      screen {Placeholder}\n{body}\n";
        return Parse(source)?.Modules.SingleOrDefault()?.Features.SingleOrDefault()?.Slices.SingleOrDefault()?.Screens.SingleOrDefault() is { } screen
            ? ([.. screen.Directives], [.. screen.Contributions])
            : null;
    }

    static string? Print(ApplicationSyntax application)
    {
        try
        {
            return _printer.Print(application);
        }
        catch (UnsupportedSyntaxForPrinting)
        {
            return null;
        }
    }

    /// <summary>
    /// The syntax of a text, without asking whether it makes sense on its own: a table's data lives in another directive.
    /// </summary>
    static ApplicationSyntax? Parse(string source) => _compiler.Parse(source, Placeholder) is { Value: { } application } ? application : null;
}

/// <summary>
/// What the documents of an application kept natively: the application-level declarations and the modules' own.
/// </summary>
public sealed record NativeResidue(IReadOnlyList<ApplicationSyntax> Applications, IReadOnlyList<ModuleSyntax> Modules)
{
    public static readonly NativeResidue Empty = new([], []);

    public IReadOnlyList<ConceptSyntax> Concepts => [.. Applications.SelectMany(application => application.Concepts).DistinctBy(concept => concept.Name, StringComparer.Ordinal)];

    public IReadOnlyList<TypeSyntax> Types => [.. Applications.SelectMany(application => application.Types ?? []).DistinctBy(type => type.Name, StringComparer.Ordinal)];

    public IReadOnlyList<SampleDataPackSyntax> SampleDataPacks => [.. Applications.SelectMany(application => application.SampleDataPacks).DistinctBy(pack => pack.Name, StringComparer.Ordinal)];

    public IReadOnlyList<UiProfileSyntax> UiProfiles => [.. Applications.SelectMany(application => application.UiProfiles ?? []).DistinctBy(profile => profile.Name, StringComparer.Ordinal)];

    public IReadOnlyList<ThemeSyntax> Themes => [.. Applications.SelectMany(application => application.Themes ?? []).DistinctBy(theme => theme.Name, StringComparer.Ordinal)];

    public IReadOnlyList<DesignSystemSyntax> DesignSystems => [.. Applications.SelectMany(application => application.DesignSystems).DistinctBy(designSystem => designSystem.Name, StringComparer.Ordinal)];

    public IReadOnlyList<BehaviorSyntax> Behaviors => [.. Applications.SelectMany(application => application.Behaviors).DistinctBy(behavior => behavior.Name, StringComparer.Ordinal)];

    public IReadOnlyList<TemplateAssignmentSyntax> Templates => [.. Applications.SelectMany(application => application.Templates)];

    public IReadOnlyList<LayoutSyntax> Layouts => [.. Applications.SelectMany(application => application.Layouts ?? []).DistinctBy(layout => layout.Name, StringComparer.Ordinal)];

    public IReadOnlyList<ModuleSyntax> ModulesNamed(string name) => [.. Modules.Where(module => module.Name == name)];

    public IReadOnlyList<FormSyntax> FormsOf(string module) => [.. ModulesNamed(module).SelectMany(syntax => syntax.Forms ?? []).DistinctBy(form => form.Name, StringComparer.Ordinal)];

    /// <summary>
    /// The feature at a path of names from the module - what the module's residue kept of it, or nothing.
    /// </summary>
    public FeatureSyntax? FeatureAt(string module, IReadOnlyList<string> path)
    {
        var features = ModulesNamed(module).SelectMany(syntax => syntax.Features).ToArray();
        FeatureSyntax? found = null;
        foreach (var name in path)
        {
            found = features.FirstOrDefault(feature => feature.Name == name);
            if (found is null)
            {
                return null;
            }

            features = [.. found.Features];
        }

        return found;
    }

    public IReadOnlyList<ContributionSyntax> ContributionsOf(string module) => [.. ModulesNamed(module).SelectMany(syntax => syntax.Contributions ?? [])];

    public IReadOnlyList<BehaviorSyntax> BehaviorsOf(string module) => [.. ModulesNamed(module).SelectMany(syntax => syntax.Behaviors).DistinctBy(behavior => behavior.Name, StringComparer.Ordinal)];

    public IReadOnlyList<UsesBehaviorSyntax> UsedBehaviorsOf(string module) => [.. ModulesNamed(module).SelectMany(syntax => syntax.UsedBehaviors)];

    public IReadOnlyList<TemplateAssignmentSyntax> TemplatesOf(string module) => [.. ModulesNamed(module).SelectMany(syntax => syntax.Templates)];

    /// <summary>
    /// The layout a document declares with what it has no member for put back.
    /// </summary>
    public LayoutSyntax Restore(LayoutSyntax layout) =>
        Layouts.FirstOrDefault(native => native.Name == layout.Name) is { } kept
            ? layout with { Arrangement = SceneArrangements.Keeps(layout.Arrangement, kept.Arrangement), Behaviors = kept.Behaviors, UsedBehaviors = kept.UsedBehaviors, Exposes = kept.Exposes }
            : layout;

    public ScreenTemplateSyntax Restore(ScreenTemplateSyntax template) =>
        Modules.SelectMany(module => module.ScreenTemplates).FirstOrDefault(native => native.Name == template.Name) is { } kept
            ? template with { Arrangement = SceneArrangements.Keeps(template.Arrangement, kept.Arrangement), Behaviors = kept.Behaviors, UsedBehaviors = kept.UsedBehaviors, Exposes = kept.Exposes }
            : template;

    public DialogTemplateSyntax Restore(DialogTemplateSyntax template) =>
        Modules.SelectMany(module => module.DialogTemplates ?? []).FirstOrDefault(native => native.Name == template.Name) is { } kept
            ? template with { Arrangement = SceneArrangements.Keeps(template.Arrangement, kept.Arrangement), Behaviors = kept.Behaviors, UsedBehaviors = kept.UsedBehaviors, Exposes = kept.Exposes }
            : template;
}
