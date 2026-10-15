// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;
using Cratis.Scene.Model.SampleData;

namespace Cratis.Scene.Engine.SampleData;

/// <summary>
/// Resolves the rows to show for a read model or shape at design or preview time, by the order of spec section 11.2.
/// </summary>
/// <remarks>
/// <list type="number">
/// <item>the pack bound to the target (the profile's <c language="csharp">SampleData.Bindings</c>, a rare override);</item>
/// <item>the application's active pack: the UI profile's <c language="csharp">SampleData.ActivePack</c>, chosen once for the whole application, or
/// the session-only override (<see cref="SampleDataContext.SessionActivePack"/>) the preview strip sets;</item>
/// <item>the default pack of the blueprint the template came from;</item>
/// <item>generated data typed by field kind (<see cref="SampleDataGenerator"/>), when the request carries a shape.</item>
/// </list>
/// A pack supplies rows when it has a set for the target, by an explicit shape-to-read-model mapping or else by name
/// (<see cref="SampleDataSetFinder"/>). A rung that cannot supply rows falls through to the next; an unknown pack id, or a bound
/// pack without the target's shape, is reported in the diagnostics (an active or blueprint pack that merely lacks the shape is
/// normal and not reported). The locale carried is the supplying pack's; for generated data it is the first existing bound, active
/// or blueprint pack's, else the context's. Outside design and preview nothing resolves. Identical to the TypeScript engine's
/// <c language="csharp">resolveSampleData</c>.
/// </remarks>
public static class SampleDataResolver
{
    /// <summary>
    /// Resolves sample data.
    /// </summary>
    /// <param name="request">What is being asked for.</param>
    /// <param name="context">What the host knows.</param>
    /// <returns>The resolution.</returns>
    public static SampleDataResolution Resolve(SampleDataRequest request, SampleDataContext context)
    {
        var target = request.Target ?? request.Shape?.Name ?? string.Empty;
        var fallbackLocale = context.Locale ?? SampleLocales.DefaultLocale;
        var diagnostics = new List<SampleDataDiagnostic>();

        if (!context.IsDesignOrPreview)
        {
            return new SampleDataResolution(SampleDataResolutionSource.Disabled, fallbackLocale, [], diagnostics);
        }

        var selection = context.Profile?.SampleData;
        var mappings = selection?.Mappings ?? [];
        SampleDataPack? Find(string? id) => id is null ? null : context.Packs.FirstOrDefault(pack => pack.Id == id);
        void Missing(string id, string role) => diagnostics.Add(new("packNotFound", $"The {role} sample data pack '{id}' is not available"));

        var bindingPackId = (selection?.Bindings ?? []).FirstOrDefault(binding => binding.Target == target)?.Pack;
        var bindingPack = Find(bindingPackId);
        if (bindingPackId is not null && bindingPack is null)
        {
            Missing(bindingPackId, "bound");
        }
        else if (bindingPack is not null)
        {
            var set = SampleDataSetFinder.Find(bindingPack, target, mappings);
            if (set is not null)
            {
                return FromSet(SampleDataResolutionSource.Binding, bindingPack, set, diagnostics);
            }

            diagnostics.Add(new("shapeNotInPack", $"The bound sample data pack '{bindingPack.Id}' has no rows for '{target}'"));
        }

        var chosenPackId = context.SessionActivePack ?? selection?.ActivePack;
        var activePackId = chosenPackId?.Length == 0 ? null : chosenPackId;
        var activePack = Find(activePackId);
        if (activePackId is not null && activePack is null)
        {
            Missing(activePackId, "active");
        }
        else if (activePack is not null)
        {
            var set = SampleDataSetFinder.Find(activePack, target, mappings);
            if (set is not null)
            {
                return FromSet(SampleDataResolutionSource.ActivePack, activePack, set, diagnostics);
            }
        }

        var blueprintPack = Find(context.BlueprintDefaultPack);
        if (context.BlueprintDefaultPack is not null && blueprintPack is null)
        {
            Missing(context.BlueprintDefaultPack, "blueprint default");
        }
        else if (blueprintPack is not null)
        {
            var set = SampleDataSetFinder.Find(blueprintPack, target, mappings);
            if (set is not null)
            {
                return FromSet(SampleDataResolutionSource.BlueprintDefault, blueprintPack, set, diagnostics);
            }
        }

        var locale = bindingPack?.Locale ?? activePack?.Locale ?? blueprintPack?.Locale ?? fallbackLocale;
        if (request.Shape is null)
        {
            return new SampleDataResolution(SampleDataResolutionSource.None, locale, [], diagnostics, Shape: target);
        }

        return new SampleDataResolution(
            SampleDataResolutionSource.Generated,
            locale,
            SampleDataGenerator.Generate(request.Shape, context.Seed, context.RowCount, locale),
            diagnostics,
            Shape: request.Shape.Name);
    }

    static SampleDataResolution FromSet(
        SampleDataResolutionSource source,
        SampleDataPack pack,
        SampleDataSet set,
        List<SampleDataDiagnostic> diagnostics) =>
        new(source, pack.Locale, [.. set.Rows.Select(row => (JsonObject)row.DeepClone())], diagnostics, pack.Id, set.Shape);
}
