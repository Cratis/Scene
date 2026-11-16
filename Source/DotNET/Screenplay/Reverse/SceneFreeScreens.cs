// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;
using Cratis.Scene.Screenplay.Forward;
using Cratis.Screenplay.Diagnostics;
using Cratis.Screenplay.Syntax;

namespace Cratis.Scene.Screenplay.Reverse;

/// <summary>
/// The screens a model declares first and a slice adopts - free screens - as the Scene document holds them, and as Screenplay says them.
/// </summary>
/// <remarks>
/// <para>
/// In a Scene document a free screen is a screen like any other, with three marks the forward converter (<see cref="FreeScreenConverter"/>) writes:
/// its <c language="text">path</c> is where it is declared (nothing for the application, the module, then the features), its
/// <c language="text">owner</c> is the slice that adopts it (empty when no slice does), and the elements that are needs carry the shape contract
/// (<c language="text">shape</c>) and what each adopting slice provides (<c language="text">provisions</c>, with the first adopter's
/// <c language="text">query</c>, <c language="text">by</c> and <c language="text">fieldMap</c> on the element itself).
/// </para>
/// <para>
/// A screen is free when its owner is empty or one of its needs is provided. A screen owned by a slice that provides nothing of it is the
/// inline screen of that slice, which Screenplay says the same way: a screen a slice declares in its own body is a screen the slice adopts.
/// </para>
/// </remarks>
public static class SceneFreeScreens
{
    const string Path = "path";
    const string Owner = "owner";
    const string Properties = "properties";

    /// <summary>
    /// Takes the free screens out of a Scene document.
    /// </summary>
    /// <param name="document">The Scene document text.</param>
    /// <returns>The document without its free screens, and the free screens with the shapes and adoptions they carry.</returns>
    public static (string Document, FreeScreenDeclarations Free) Extract(string document)
    {
        var upgraded = SceneDocumentUpgrade.Upgrade(document);
        if (SceneJson.Parse(upgraded) is not { } root || root["screens"] is not JsonArray screens || !screens.OfType<JsonObject>().Any(IsFree))
        {
            return (document, FreeScreenDeclarations.None);
        }

        var gaps = new SceneTransportGaps();
        var free = screens.OfType<JsonObject>().Where(IsFree).ToArray();
        var shapes = new Dictionary<string, ShapeSyntax>(StringComparer.Ordinal);
        var found = new List<(int Index, SceneFreeAdoption Adoption)>();
        var cleaned = new JsonArray();
        List<IReadOnlyList<string>> paths = [];
        foreach (var screen in free)
        {
            var copy = (JsonObject)screen.DeepClone();
            var adoptions = new List<SceneFreeAdoption>();
            paths.Add([.. SceneJson.Array(screen, Path).Select(step => step?.GetValue<string>() ?? string.Empty)]);
            Strip(copy, string.Empty, shapes, adoptions);
            found.AddRange(adoptions.Select(adoption => (paths.Count - 1, adoption)));
            cleaned.Add(copy);
        }

        var freeRoot = (JsonObject)root.DeepClone();
        freeRoot["screens"] = cleaned;
        var (syntaxes, _, _) = SceneScreens.ToSyntax(string.Empty, freeRoot, gaps);
        var declared = syntaxes.Select((syntax, index) => new SceneFreeScreen(paths[index], syntax)).ToArray();

        var remainder = (JsonObject)root.DeepClone();
        remainder["screens"] = new JsonArray([.. screens.OfType<JsonObject>().Where(screen => !IsFree(screen)).Select(screen => screen.DeepClone())]);
        var adopted = found.Where(entry => entry.Index < declared.Length).Select(entry => entry.Adoption with { Screen = declared[entry.Index].Screen.Name });
        return (remainder.ToJsonString(SceneDocumentJson.Options), new(declared, [.. shapes.Values], [.. adopted], gaps.Messages));
    }

    /// <summary>
    /// Writes the free screens of a compiled application as the Scene document that holds them: one document for every free screen of the application.
    /// </summary>
    /// <param name="application">The compiled application.</param>
    /// <returns>The document, or null when the application declares no free screen.</returns>
    public static ImportedScreenDocument? Read(ApplicationSyntax application)
    {
        List<(IReadOnlyList<string> Path, ScreenSyntax Screen)> free = [.. (application.Screens ?? []).Select(screen => ((IReadOnlyList<string>)[], screen))];
        List<FormSyntax> forms = [];
        foreach (var module in application.Modules)
        {
            forms.AddRange(module.Forms ?? []);
            free.AddRange((module.Screens ?? []).Select(screen => ((IReadOnlyList<string>)[module.Name], screen)));
            foreach (var feature in Features(module.Features, [module.Name]))
            {
                free.AddRange((feature.Feature.Screens ?? []).Select(screen => (feature.Path, screen)));
            }
        }

        if (free.Count == 0)
        {
            return null;
        }

        var shapes = (application.Shapes ?? []).ToDictionary(shape => shape.Name, StringComparer.Ordinal);
        var adoptions = FreeScreenConverter.Adoptions(application);
        var allScreens = application.Modules.SelectMany(module => Features(module.Features, [module.Name])).SelectMany(feature => feature.Feature.Slices).SelectMany(slice => slice.Screens).Select(screen => screen.Name)
            .Concat(free.Select(entry => entry.Screen.Name)).ToArray();
        var document = SceneScreens.ToJson(string.Empty, free.Select(entry => entry.Screen), forms, SceneDeclarationSet.Empty, allScreens, verbatim: true);
        foreach (var screen in SceneJson.Array(document, "screens").OfType<JsonObject>())
        {
            var name = SceneJson.String(screen, "name") ?? string.Empty;
            var entry = free.First(candidate => candidate.Screen.Name == name || SceneScreenNames.OfOwnScreens([candidate.Screen.Name]).ToScene(candidate.Screen.Name) == name);
            var adopted = adoptions.GetValueOrDefault(entry.Screen.Name) ?? [];
            screen[Path] = new JsonArray([.. entry.Path.Select(step => (JsonNode?)JsonValue.Create(step))]);
            screen[Owner] = adopted.Count > 0 ? adopted[0].Slice : string.Empty;
            Bind(screen, shapes, adopted);
        }

        return new(Guid.Empty, null, document.ToJsonString(SceneDocumentJson.Options));
    }

    /// <summary>
    /// Declares the free screens of Scene documents on an application: the screens where they are declared, the shapes they need, and the slices that adopt them.
    /// </summary>
    /// <param name="free">The free screens the documents hold.</param>
    /// <param name="modules">The modules of the application.</param>
    /// <param name="applicationScreens">The screens declared on the application itself.</param>
    /// <param name="shapes">The shapes the needs are contracts of.</param>
    /// <returns>The modules with the free screens and the slices that adopt them declared.</returns>
    /// <remarks>
    /// A document knows an adopting slice by its path only, so each is declared with the read model and query that provide what it provides: the
    /// read model holds the fields of the shape - under the path a mapping reads when the names differ - so what adopts the screen compiles.
    /// </remarks>
    public static List<ModuleSyntax> OnApplication(FreeScreenDeclarations free, List<ModuleSyntax> modules, out List<ScreenSyntax> applicationScreens, out List<ShapeSyntax> shapes)
    {
        shapes = [.. free.Shapes];
        List<ScreenSyntax> application = [];
        foreach (var declared in free.Screens)
        {
            switch (declared.Path.Count)
            {
                case 0:
                    application.Add(declared.Screen);
                    break;
                default:
                    var module = ModuleOf(modules, declared.Path[0]);
                    if (declared.Path.Count == 1)
                    {
                        Replace(modules, module with { Screens = [.. module.Screens ?? [], declared.Screen] });
                    }
                    else
                    {
                        Replace(modules, module with { Features = DeclareFeature(module.Features, [.. declared.Path.Skip(1)], feature => feature with { Screens = [.. feature.Screens ?? [], declared.Screen] }) });
                    }

                    break;
            }
        }

        foreach (var adoption in free.Adoptions)
        {
            var path = adoption.Slice.Split('.');
            if (path.Length < 3)
            {
                continue;
            }

            var module = ModuleOf(modules, path[0]);
            var shape = free.Shapes.FirstOrDefault(candidate => candidate.Name == adoption.Provision.Need) ?? (free.Shapes.Count > 0 ? free.Shapes[0] : null);
            Replace(modules, module with
            {
                Features = DeclareFeature(module.Features, [.. path.Skip(1).Take(path.Length - 2)], feature =>
                    feature with { Slices = [.. Slice(feature.Slices, path[^1], adoption, shape)] })
            });
        }

        applicationScreens = application;
        return modules;
    }

    static ModuleSyntax ModuleOf(List<ModuleSyntax> modules, string name)
    {
        var existing = modules.Find(module => module.Name == name);
        if (existing is not null)
        {
            return existing;
        }

        var created = new ModuleSyntax(name, [], [], SourceLocation.Start);
        modules.Add(created);
        return created;
    }

    static void Replace(List<ModuleSyntax> modules, ModuleSyntax module) => modules[modules.FindIndex(candidate => candidate.Name == module.Name)] = module;

    static List<FeatureSyntax> DeclareFeature(IEnumerable<FeatureSyntax> features, IReadOnlyList<string> path, Func<FeatureSyntax, FeatureSyntax> change)
    {
        var list = features.ToList();
        var index = list.FindIndex(feature => feature.Name == path[0]);
        var declared = index >= 0 ? list[index] : new FeatureSyntax(path[0], [], [], SourceLocation.Start);
        declared = path.Count > 1 ? declared with { Features = DeclareFeature(declared.Features, [.. path.Skip(1)], change) } : change(declared);
        if (index >= 0)
        {
            list[index] = declared;
        }
        else
        {
            list.Add(declared);
        }

        return list;
    }

    static List<SliceSyntax> Slice(IEnumerable<SliceSyntax> slices, string name, SceneFreeAdoption adoption, ShapeSyntax? shape)
    {
        var all = slices.ToList();
        var index = all.FindIndex(slice => slice.Name == name);
        var existing = index >= 0 ? all[index] : new SliceSyntax(Cratis.Screenplay.Syntax.SliceType.StateView, name, [], [], [], [], [], [], [], [], [], SourceLocation.Start);
        var query = adoption.Provision.Query;
        var model = query + "Row";
        var mapped = adoption.Provision.Mappings.ToDictionary(mapping => mapping.Field, mapping => mapping.Path, StringComparer.Ordinal);
        var fields = (shape?.Properties ?? []).Select(property => new PropertySyntax(mapped.GetValueOrDefault(property.Name, property.Name), property.Type with { IsCollection = false }, SourceLocation.Start, false)).ToArray();
        var declared = existing with
        {
            ReadModels = [.. existing.ReadModels ?? [], .. (existing.ReadModels ?? []).Any(candidate => candidate.Name == model) ? [] : new[] { new ReadModelSyntax(model, fields, SourceLocation.Start, null) }],
            Queries = [.. existing.Queries, .. existing.Queries.Any(candidate => candidate.Name == query) ? [] : new[] { new QuerySyntax(query, new TypeRefSyntax(model, true, false, SourceLocation.Start), null, [], null, SourceLocation.Start, null, null, false) }],
            UsedScreens = [.. existing.UsedScreens ?? [], .. (existing.UsedScreens ?? []).Any(used => used.Screen == adoption.Screen)
                ? []
                : new[] { new UsesScreenSyntax(adoption.Screen, SourceLocation.Start) { Provisions = [.. free(adoption)] } }]
        };
        if (index >= 0)
        {
            all[index] = declared;
        }
        else
        {
            all.Add(declared);
        }

        return all;

        static IEnumerable<ScreenProvisionSyntax> free(SceneFreeAdoption entry) => [entry.Provision];
    }

    static bool IsFree(JsonObject screen) =>
        (screen[Owner] is JsonValue owner && owner.TryGetValue<string>(out var text) && text.Length == 0) || Needs(screen).Any(need => need.Properties?["provisions"] is not null);

    static IEnumerable<(JsonObject Element, JsonObject? Properties)> Needs(JsonNode? node)
    {
        switch (node)
        {
            case JsonObject json:
                if (SceneJson.String(json, "componentName") == "core:data")
                {
                    yield return (json, SceneJson.Object(json, Properties));
                }

                foreach (var child in json)
                {
                    foreach (var need in Needs(child.Value))
                    {
                        yield return need;
                    }
                }

                break;
            case JsonArray array:
                foreach (var item in array)
                {
                    foreach (var need in Needs(item))
                    {
                        yield return need;
                    }
                }

                break;
        }
    }

    static void Strip(JsonObject screen, string name, Dictionary<string, ShapeSyntax> shapes, List<SceneFreeAdoption> adoptions)
    {
        screen.Remove(Owner);
        screen.Remove(Path);
        foreach (var (element, properties) in Needs(screen).ToArray())
        {
            if (properties is null || (properties["query"] is not null && properties["provisions"] is null))
            {
                continue;
            }

            var typeName = SceneJson.String(properties, "typeName") ?? string.Empty;
            var need = SceneJson.String(properties, "need") ?? typeName;
            if (properties["shape"] is JsonArray fields && !shapes.ContainsKey(typeName))
            {
                shapes[typeName] = new ShapeSyntax(
                    typeName,
                    [.. fields.OfType<JsonObject>().Select(field => new PropertySyntax(
                        SceneJson.String(field, "name") ?? string.Empty,
                        new TypeRefSyntax(SceneJson.String(field, "type") ?? "String", false, field["optional"] is JsonValue optional && optional.TryGetValue<bool>(out var isOptional) && isOptional, SourceLocation.Start),
                        SourceLocation.Start,
                        false))],
                    SourceLocation.Start,
                    null);
            }

            foreach (var provision in SceneJson.Array(properties, "provisions").OfType<JsonObject>())
            {
                var fieldMap = SceneJson.Object(provision, "fieldMap") ?? [];
                adoptions.Add(new(
                    SceneJson.String(provision, "slice") ?? string.Empty,
                    name,
                    new ScreenProvisionSyntax(need, SceneJson.String(provision, "query") ?? string.Empty, SceneJson.String(provision, "by"), SourceLocation.Start)
                    {
                        Mappings = [.. fieldMap.Select(mapping => new ScreenProvisionMappingSyntax(mapping.Key, mapping.Value?.GetValue<string>() ?? string.Empty, SourceLocation.Start))]
                    }));
            }

            foreach (var member in new[] { "query", "by", "fieldMap", "provisions", "shape" })
            {
                properties.Remove(member);
            }
        }
    }

    static void Bind(JsonObject screen, Dictionary<string, ShapeSyntax> shapes, IReadOnlyList<FreeScreenConverter.Adoption> adoptions)
    {
        foreach (var (_, properties) in Needs(screen).ToArray())
        {
            if (properties is null || properties["query"] is not null || SceneJson.String(properties, "typeName") is not { } typeName)
            {
                continue;
            }

            var need = SceneJson.String(properties, "need") ?? typeName;
            if (shapes.TryGetValue(typeName, out var shape))
            {
                properties["shape"] = new JsonArray([.. shape.Properties.Select(property => (JsonNode)new JsonObject
                {
                    ["name"] = property.Name,
                    ["type"] = property.Type.Name,
                    ["optional"] = property.Type.IsOptional
                })]);
            }

            var provided = adoptions.Select(adoption => (adoption.Slice, Provision: adoption.Provisions.FirstOrDefault(provision => provision.Need == need))).Where(entry => entry.Provision is not null).ToList();
            if (provided.Count == 0)
            {
                continue;
            }

            var first = provided[0].Provision!;
            properties["query"] = first.Query;
            properties["by"] = first.By;
            if (first.Fields.Count > 0)
            {
                properties["fieldMap"] = new JsonObject([.. first.Fields.Select(field => KeyValuePair.Create<string, JsonNode?>(field.Key, field.Value))]);
            }

            properties["provisions"] = new JsonArray([.. provided.Select(entry => (JsonNode)new JsonObject
            {
                ["slice"] = entry.Slice,
                ["query"] = entry.Provision!.Query,
                ["by"] = entry.Provision.By,
                ["fieldMap"] = new JsonObject([.. entry.Provision.Fields.Select(field => KeyValuePair.Create<string, JsonNode?>(field.Key, field.Value))])
            })]);
        }
    }

    static IEnumerable<(IReadOnlyList<string> Path, FeatureSyntax Feature)> Features(IEnumerable<FeatureSyntax> features, IReadOnlyList<string> parent) =>
        features.SelectMany(feature =>
        {
            IReadOnlyList<string> path = [.. parent, feature.Name];
            return new[] { (path, feature) }.Concat(Features(feature.Features, path));
        });
}

/// <summary>
/// A free screen read out of a Scene document: the screen, and where it is declared.
/// </summary>
/// <param name="Path">The module, then each feature, that declares the screen; nothing for the application.</param>
/// <param name="Screen">The screen as Screenplay says it.</param>
public sealed record SceneFreeScreen(IReadOnlyList<string> Path, ScreenSyntax Screen);

/// <summary>
/// One slice's provision of a free screen's need, read out of a Scene document.
/// </summary>
/// <param name="Slice">The adopting slice's path: module, features and the slice's name, joined by dots.</param>
/// <param name="Screen">The name of the screen it adopts.</param>
/// <param name="Provision">What it provides.</param>
public sealed record SceneFreeAdoption(string Slice, string Screen, ScreenProvisionSyntax Provision);

/// <summary>
/// The free screens of Scene documents, with the shapes they need and the slices that adopt them.
/// </summary>
/// <param name="Screens">The free screens.</param>
/// <param name="Shapes">The shapes the needs are contracts of.</param>
/// <param name="Adoptions">What the adopting slices provide.</param>
/// <param name="Diagnostics">What the document holds that Screenplay cannot say.</param>
public sealed record FreeScreenDeclarations(
    IReadOnlyList<SceneFreeScreen> Screens,
    IReadOnlyList<ShapeSyntax> Shapes,
    IReadOnlyList<SceneFreeAdoption> Adoptions,
    IReadOnlyList<string> Diagnostics)
{
    /// <summary>
    /// Gets the declarations of a document with no free screen.
    /// </summary>
    public static readonly FreeScreenDeclarations None = new([], [], [], []);

    /// <summary>
    /// Merges the free screens of several documents: a screen, a shape and an adoption declared twice is declared once, the first wins.
    /// </summary>
    /// <param name="all">The declarations of each document.</param>
    /// <returns>The merged declarations.</returns>
    public static FreeScreenDeclarations Merge(IEnumerable<FreeScreenDeclarations> all)
    {
        var sets = all.ToArray();
        return new(
            [.. sets.SelectMany(set => set.Screens).DistinctBy(screen => screen.Screen.Name, StringComparer.Ordinal)],
            [.. sets.SelectMany(set => set.Shapes).DistinctBy(shape => shape.Name, StringComparer.Ordinal)],
            [.. sets.SelectMany(set => set.Adoptions).DistinctBy(adoption => (adoption.Slice, adoption.Screen, adoption.Provision.Need))],
            [.. sets.SelectMany(set => set.Diagnostics)]);
    }
}
