// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;

namespace Cratis.Scene.Engine.Slots;

/// <summary>
/// Recognizes and upgrades the presentation an <c language="csharp">action</c> component stored before Scene 5 replaced it with
/// <c language="csharp">opens</c>, for <see cref="SlotShapeUpgrader"/> and <see cref="SlotShapeValidator"/>. The TypeScript twin is
/// <c language="csharp">upgradeActionPresentation</c>.
/// </summary>
static class LegacyActionPresentation
{
    /// <summary>
    /// The property an <c language="csharp">action</c> component stored its presentation in.
    /// </summary>
    public const string Property = "presentation";

    /// <summary>
    /// What the validator tells a document whose <c language="csharp">action</c> component still stores a presentation.
    /// </summary>
    public const string MigrationHint = "Scene 5 replaced an action's presentation with opens: upgrade the document (upgradeSlotShape, or SlotShapeUpgrader in C#), or run `screenplay migrate --from 5 --to 6` on its Screenplay source";

    static readonly Dictionary<string, string> _opens = new(StringComparer.OrdinalIgnoreCase)
    {
        ["none"] = "none",
        ["modal"] = "dialog",
        ["drawer"] = "drawer",
    };

    /// <summary>
    /// Tells whether an object is an <c language="csharp">action</c> component - any package's <c language="csharp">&lt;package&gt;:action</c> -
    /// that stores a presentation.
    /// </summary>
    /// <param name="value">The object.</param>
    /// <returns>Whether it stores a legacy presentation.</returns>
    public static bool IsLegacy(JsonObject value) =>
        IsActionComponent(value) && value["properties"] is JsonObject properties && properties.ContainsKey(Property);

    /// <summary>
    /// Tells whether an object is an <c language="csharp">action</c> component of any package.
    /// </summary>
    /// <param name="value">The object.</param>
    /// <returns>Whether it is one.</returns>
    public static bool IsActionComponent(JsonObject value) =>
        LegacyOutletShape.Text(value["componentName"]) is { } name && name.EndsWith(":action", StringComparison.Ordinal);

    /// <summary>
    /// Turns an <c language="csharp">action</c> component's presentation into <c language="csharp">opens</c>: <c language="csharp">none</c> runs
    /// directly, <c language="csharp">modal</c> becomes <c language="csharp">dialog</c> and <c language="csharp">drawer</c> stays, in any letter case.
    /// A presentation of another value, or one next to an <c language="csharp">opens</c> that says otherwise, is reported and kept.
    /// </summary>
    /// <param name="owner">The object, which is changed in place.</param>
    /// <param name="path">The JSON path of the object.</param>
    /// <param name="diagnostics">Where what cannot be mapped is reported.</param>
    /// <returns>Whether the object changed.</returns>
    public static bool Upgrade(JsonObject owner, string path, List<SlotShapeDiagnostic> diagnostics)
    {
        if (!IsLegacy(owner))
        {
            return false;
        }

        var properties = (JsonObject)owner["properties"]!;
        var presentation = properties[Property];
        var id = LegacyOutletShape.Describe(owner["id"]);
        var propertyPath = $"{path}.properties.{Property}";
        if (LegacyOutletShape.Text(presentation) is not { } text || !_opens.TryGetValue(text, out var opens))
        {
            diagnostics.Add(new(
                SlotShapeDiagnosticCode.LegacyActionPresentation,
                propertyPath,
                $"The action '{id}' is presented as '{LegacyOutletShape.Describe(presentation)}', which is not none, modal or drawer, so it has no opens to become"));
            return false;
        }

        if (properties["opens"] is { } existing && LegacyOutletShape.Text(existing) != opens)
        {
            diagnostics.Add(new(
                SlotShapeDiagnosticCode.LegacyActionPresentation,
                propertyPath,
                $"The action '{id}' is presented as '{text}' but opens '{LegacyOutletShape.Describe(existing)}'; keep one"));
            return false;
        }

        var upgraded = new JsonObject();
        foreach (var (key, value) in properties.ToList())
        {
            if (key == Property)
            {
                upgraded["opens"] = opens;
            }
            else if (key != "opens")
            {
                upgraded[key] = value?.DeepClone();
            }
        }

        owner["properties"] = upgraded;
        return true;
    }
}
