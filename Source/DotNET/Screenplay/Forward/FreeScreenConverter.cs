// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Elements;
using SceneScreens = Cratis.Scene.Model.Screens;
using ScreenplaySyntax = Cratis.Screenplay.Syntax;

namespace Cratis.Scene.Screenplay.Forward;

/// <summary>
/// Converts the screens a model declares first and lets a slice adopt - free screens - into Scene screens with their data bound.
/// </summary>
/// <remarks>
/// <para>
/// A free screen is declared at the top level, in a module or in a feature, and says what data it needs without saying where the data comes
/// from: <c language="screenplay">data Invoice[]</c> with no query is a <em>need</em>. A slice adopts the screen with
/// <c language="screenplay">uses screen</c> and provides each need from one of its queries, with
/// <c language="screenplay">&lt;field&gt; from &lt;path&gt;</c> where the names differ.
/// </para>
/// <para>
/// In Scene a free screen is one screen. Its need becomes a <c language="text">core:data</c> element exactly like an inline one, carrying
/// the shape contract (<see cref="ShapeProperty"/>: the fields a top-level <c language="screenplay">shape</c> declares) and, once adopted, the
/// binding the provision states: the query, the parameter it is read by and the field mapping (<see cref="FieldMapProperty"/>). A screen several slices adopt
/// is owned by the first and lists every adoption in <see cref="ProvisionsProperty"/>, so a host that scopes a preview to a slice finds its own binding
/// and nothing about what any adopter provides is lost. A need nobody provides stays a need - a design-time screen - and is reported by Screenplay, not here.
/// </para>
/// </remarks>
public static class FreeScreenConverter
{
    /// <summary>
    /// The property a need carries the fields of its shape in: a list of <c language="text">{ name, type, optional }</c>.
    /// </summary>
    public const string ShapeProperty = "shape";

    /// <summary>
    /// The property a bound need carries the mapping of the fields whose names differ in: the field of the shape, by the path it reads on the read model.
    /// </summary>
    public const string FieldMapProperty = "fieldMap";

    /// <summary>
    /// The property a need carries every adoption in: a list of <c language="text">{ slice, query, by, fieldMap }</c>, one per adopting slice that provides it.
    /// </summary>
    public const string ProvisionsProperty = "provisions";

    /// <summary>
    /// The property a need that is declared with an alias carries the alias in.
    /// </summary>
    public const string NeedProperty = "need";

    /// <summary>
    /// Converts every free screen of the application.
    /// </summary>
    /// <param name="application">The compiled application.</param>
    /// <param name="layoutName">The layout the application's screens are placed on.</param>
    /// <param name="scope">The behavior scope.</param>
    /// <param name="diagnostics">The collector, or null to omit silently.</param>
    /// <returns>The free screens as Scene screens, in declaration order: the application's, then each module's and each feature's.</returns>
    public static IReadOnlyList<SceneScreens.Screen> Convert(ScreenplaySyntax.ApplicationSyntax application, string layoutName, BehaviorScope scope, ConversionDiagnostics? diagnostics)
    {
        var shapes = (application.Shapes ?? []).ToDictionary(shape => shape.Name, StringComparer.Ordinal);
        var adoptions = Adoptions(application);
        List<SceneScreens.Screen> screens = [];

        foreach (var screen in application.Screens ?? [])
        {
            Add(screen, [], []);
        }

        foreach (var module in application.Modules)
        {
            IReadOnlyList<string> modulePath = [module.Name];
            foreach (var screen in module.Screens ?? [])
            {
                Add(screen, modulePath, module.Forms?.ToList() ?? []);
            }

            foreach (var feature in module.Features)
            {
                AddFeature(feature, modulePath, module.Forms?.ToList() ?? []);
            }
        }

        return screens;

        void AddFeature(ScreenplaySyntax.FeatureSyntax feature, IReadOnlyList<string> parent, IReadOnlyList<ScreenplaySyntax.FormSyntax> forms)
        {
            IReadOnlyList<string> path = [.. parent, feature.Name];
            foreach (var screen in feature.Screens ?? [])
            {
                Add(screen, path, forms);
            }

            foreach (var sub in feature.Features)
            {
                AddFeature(sub, path, forms);
            }
        }

        void Add(ScreenplaySyntax.ScreenSyntax screen, IReadOnlyList<string> path, IReadOnlyList<ScreenplaySyntax.FormSyntax> forms)
        {
            if (ScreenConverter.Convert(screen, layoutName, forms, [], scope, [], path, diagnostics) is not { } converted)
            {
                return;
            }

            var adopted = adoptions.GetValueOrDefault(screen.Name) ?? [];
            screens.Add(converted with
            {
                SlotContent = converted.SlotContent.ToDictionary(slot => slot.Key, slot => (IReadOnlyList<SceneElement>)[.. slot.Value.Select(element => Bind(element, shapes, adopted))]),
                Owner = adopted.Count > 0 ? adopted[0].Slice : null
            });
        }
    }

    /// <summary>
    /// Gets the adoptions of the application by the name of the screen they adopt.
    /// </summary>
    /// <param name="application">The compiled application.</param>
    /// <returns>Each adopting slice, qualified by its path, with what it provides, by screen name.</returns>
    public static IReadOnlyDictionary<string, IReadOnlyList<Adoption>> Adoptions(ScreenplaySyntax.ApplicationSyntax application)
    {
        Dictionary<string, List<Adoption>> adoptions = new(StringComparer.Ordinal);

        void Collect(ScreenplaySyntax.FeatureSyntax feature, IReadOnlyList<string> parent)
        {
            IReadOnlyList<string> path = [.. parent, feature.Name];
            foreach (var slice in feature.Slices)
            {
                foreach (var used in slice.UsedScreens ?? [])
                {
                    if (!adoptions.TryGetValue(used.Screen, out var list))
                    {
                        adoptions[used.Screen] = list = [];
                    }

                    list.Add(new(string.Join('.', [.. path, slice.Name]), [.. used.Provisions.Select(provision => new Provision(
                        provision.Need,
                        provision.Query,
                        provision.By,
                        provision.Mappings.ToDictionary(mapping => mapping.Field, mapping => mapping.Path, StringComparer.Ordinal)))]));
                }
            }

            foreach (var sub in feature.Features)
            {
                Collect(sub, path);
            }
        }

        foreach (var module in application.Modules)
        {
            foreach (var feature in module.Features)
            {
                Collect(feature, [module.Name]);
            }
        }

        return adoptions.ToDictionary(entry => entry.Key, entry => (IReadOnlyList<Adoption>)entry.Value, StringComparer.Ordinal);
    }

    static SceneElement Bind(SceneElement element, IReadOnlyDictionary<string, ScreenplaySyntax.ShapeSyntax> shapes, IReadOnlyList<Adoption> adoptions)
    {
        if (element is not ExternalComponent component)
        {
            return element;
        }

        var slots = component.Slots.ToDictionary(slot => slot.Key, slot => (IReadOnlyList<SceneElement>)[.. slot.Value.Select(child => Bind(child, shapes, adoptions))]);
        var properties = component.Properties;
        if (component.ComponentName == "core:data" && properties.GetValueOrDefault(SceneElementProperties.Query) is null && properties.GetValueOrDefault(SceneElementProperties.TypeName) is string typeName)
        {
            var need = properties.GetValueOrDefault(NeedProperty) as string ?? typeName;
            var bound = new Dictionary<string, object?>(properties);
            if (shapes.TryGetValue(typeName, out var shape))
            {
                bound[ShapeProperty] = shape.Properties.Select(property => (object)new Dictionary<string, object?>
                {
                    ["name"] = property.Name,
                    ["type"] = property.Type.Name,
                    ["optional"] = property.Type.IsOptional
                }).ToList();
            }

            var provided = adoptions
                .Select(adoption => (adoption.Slice, Provision: adoption.Provisions.FirstOrDefault(provision => provision.Need == need)))
                .Where(entry => entry.Provision is not null)
                .ToList();
            if (provided.Count > 0)
            {
                var first = provided[0].Provision!;
                bound[SceneElementProperties.Query] = first.Query;
                bound["by"] = first.By;
                if (first.Fields.Count > 0)
                {
                    bound[FieldMapProperty] = new Dictionary<string, object?>(first.Fields.ToDictionary(field => field.Key, field => (object?)field.Value));
                }

                bound[ProvisionsProperty] = provided.ConvertAll(entry => (object)new Dictionary<string, object?>
                {
                    ["slice"] = entry.Slice,
                    ["query"] = entry.Provision!.Query,
                    ["by"] = entry.Provision.By,
                    [FieldMapProperty] = entry.Provision.Fields.ToDictionary(field => field.Key, field => (object?)field.Value)
                });
            }

            properties = bound;
        }

        return component with { Properties = properties, Slots = slots };
    }

    /// <summary>
    /// One slice that adopts a free screen, and what it provides.
    /// </summary>
    /// <param name="Slice">The slice's path: module, features and the slice's name, joined by dots.</param>
    /// <param name="Provisions">What the slice provides of the screen's needs.</param>
    public sealed record Adoption(string Slice, IReadOnlyList<Provision> Provisions);

    /// <summary>
    /// The provision of one need: the query it comes from, the parameter it is read by, and the fields whose names differ.
    /// </summary>
    /// <param name="Need">The need provided: the shape's name, or the alias the screen gives it.</param>
    /// <param name="Query">The query that provides it.</param>
    /// <param name="By">The parameter the need is read by, or null.</param>
    /// <param name="Fields">The path on the read model of each field of the shape whose name differs.</param>
    public sealed record Provision(string Need, string Query, string? By, IReadOnlyDictionary<string, string> Fields);
}
