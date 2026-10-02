// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;

namespace Cratis.Scene.Engine.Editing;

/// <summary>
/// Checks what the scope itself set on properties that were exposed to it. A value it has not changed is left alone - a value
/// set before an exposure was withdrawn is kept, not refused. A value it has set or changed must have been exposed to it, and for
/// a collection each thing done to its items - adding, removing, reordering, changing a field - must have been granted, and a
/// field must be one the owner left editable. Items that are not its own cannot be touched: it only ever holds its own.
/// </summary>
static class ContributionChecker
{
    /// <summary>
    /// Checks what the scope set.
    /// </summary>
    /// <param name="context">The check being made.</param>
    /// <param name="chain">The chain the scope sits in.</param>
    /// <param name="grants">What each instance in the chain may configure.</param>
    public static void Check(ChangeContext context, IReadOnlyList<TemplateChainLevel> chain, ExposureGrants grants)
    {
        var instance = context.Scope.Instance();
        var submitted = context.Submitted.ContributionsOf(instance).ToList();
        var previous = context.Previous?.ContributionsOf(instance).ToList() ?? [];

        foreach (var key in submitted.Concat(previous).Select(entry => entry.Key).Distinct())
        {
            var now = submitted.Find(entry => entry.Key == key);
            var before = previous.Find(entry => entry.Key == key);
            if (JsonData.DeepEquals(now?.Raw, before?.Raw))
            {
                continue;
            }

            var grant = grants.Find(instance, key.Component, key.Path);
            if (grant is null)
            {
                context.Add(
                    SceneDocumentViolationCode.ContributionNotExposed,
                    $"'{key.Path}' on '{key.Component}' is not exposed to {context.Scope.Describe()}. An owner exposes it, and each template between re-exposes it.",
                    instance);
                continue;
            }

            if ((now is not null && now.Contribution is null) || (before is not null && before.Contribution is null))
            {
                context.Add(SceneDocumentViolationCode.InvalidEdit, $"What {context.Scope.Describe()} set for '{key.Path}' on '{key.Component}' is not shaped as a contribution.", instance);
                continue;
            }

            if (now?.Contribution?.Items is null && before?.Contribution?.Items is null)
            {
                continue;
            }

            CollectionChange.Check(context, grant, now?.Contribution?.Items ?? [], before?.Contribution?.Items ?? [], OwnedItemIds(chain, grant));
        }
    }

    /// <summary>
    /// The ids of the items the owner put in the collection itself: they are fixed, and no instance's item may share one.
    /// </summary>
    /// <param name="chain">The chain the scope sits in.</param>
    /// <param name="grant">What the scope may do to the collection.</param>
    /// <returns>The ids.</returns>
    static HashSet<string> OwnedItemIds(IReadOnlyList<TemplateChainLevel> chain, ExposureGrant grant)
    {
        var owner = chain.FirstOrDefault(level => level.Owner == grant.Owner);
        if (owner is null || !owner.Components.TryGetValue(grant.Component, out var component))
        {
            return [];
        }

        var items = component.TryGetProperty("properties", out var properties) ? JsonData.Path(properties, grant.Path) : null;
        return items is { ValueKind: JsonValueKind.Array }
            ? [.. items.Value.EnumerateArray().Select(item => JsonData.String(item, "id")).OfType<string>()]
            : [];
    }
}
