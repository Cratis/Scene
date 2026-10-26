// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;

namespace Cratis.Scene.Engine.Guards;

/// <summary>
/// The selected branch or its fail-closed disposition.
/// </summary>
/// <param name="Kind">Alternative, otherwise, hidden, noSubject or unevaluable, in wire casing.</param>
/// <param name="Index">The first matching alternative's zero-based index.</param>
public record GuardedSelection(string Kind, int? Index = null)
{
    /// <summary>
    /// Chooses exactly one ordered action branch.
    /// </summary>
    /// <param name="alternatives">The alternatives containing conditions.</param>
    /// <param name="item">The selected subject.</param>
    /// <param name="otherwise">The fallback object.</param>
    /// <returns>A branch index or fallback disposition.</returns>
    public static GuardedSelection SelectAction(JsonElement alternatives, JsonElement item, JsonElement otherwise = default)
    {
        var selection = SelectInteraction(alternatives, item, Text(Get(otherwise, "outcome")) == "Execute");
        return selection.Kind == "unmatched" ? new("hidden") : selection;
    }

    /// <summary>
    /// Chooses one whole interaction branch, without executing it.
    /// </summary>
    /// <param name="alternatives">The alternatives containing conditions.</param>
    /// <param name="item">The gesture subject.</param>
    /// <param name="hasOtherwise">Whether an otherwise action list exists.</param>
    /// <returns>A branch index or no-match disposition.</returns>
    public static GuardedSelection SelectInteraction(JsonElement alternatives, JsonElement item, bool hasOtherwise = false)
    {
        if (item.ValueKind != JsonValueKind.Object) return new("noSubject");
        if (alternatives.ValueKind != JsonValueKind.Array || alternatives.EnumerateArray().Any(alternative => !GuardConditions.CanEvaluate(Get(alternative, "condition")))) return new("unevaluable");
        var index = 0;
        foreach (var alternative in alternatives.EnumerateArray())
        {
            if (GuardConditions.Evaluate(Get(alternative, "condition"), item) == true) return new("alternative", index);
            index++;
        }
        return new(hasOtherwise ? "otherwise" : "unmatched");
    }

    static string Text(JsonElement value) => value.ValueKind == JsonValueKind.String ? value.GetString()! : string.Empty;
    static JsonElement Get(JsonElement value, string property) => value.ValueKind == JsonValueKind.Object && value.TryGetProperty(property, out var found) ? found : default;
}
