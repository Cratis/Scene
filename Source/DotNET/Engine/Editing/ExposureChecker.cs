// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Editing;
using Cratis.Scene.Model.Exposure;

namespace Cratis.Scene.Engine.Editing;

/// <summary>
/// Checks the exposures the scope itself declares. A layout or template decides what it exposes, so a new exposure of one of its
/// own components is its own to make. A re-exposure passes on what an outer owner exposed, and exposure only ever narrows: it may
/// not pass on something that owner never exposed, nor more of it than the owner granted.
/// </summary>
static class ExposureChecker
{
    /// <summary>
    /// Checks what the scope declares.
    /// </summary>
    /// <param name="context">The check being made.</param>
    /// <param name="chain">The chain the scope sits in.</param>
    /// <param name="grants">What each instance in the chain may configure.</param>
    public static void Check(ChangeContext context, IReadOnlyList<TemplateChainLevel> chain, ExposureGrants grants)
    {
        if (context.Scope.Kind == EditingScopeKind.Screen)
        {
            return;
        }

        var owned = chain.Count == 0 ? null : chain[^1];
        var instance = context.Scope.Instance();
        var scopeName = context.Scope.Name;
        if (context.Submitted.Exposures.GetValueOrDefault(scopeName) is not { } entry)
        {
            return;
        }

        var stored = context.Previous?.Exposures.GetValueOrDefault(scopeName);
        if (entry.Declaration?.Properties is not { } properties)
        {
            if (stored is null || !JsonData.DeepEquals(stored.Raw, entry.Raw))
            {
                context.Add(SceneDocumentViolationCode.InvalidEdit, $"What '{scopeName}' exposes is not a list of exposed properties.", scopeName);
            }

            return;
        }

        var before = stored?.Declaration?.Properties ?? [];
        foreach (var property in properties.Where(candidate => !before.Any(existing => Same(existing, candidate))))
        {
            if (property.ReExposes is null)
            {
                if (owned?.Components.ContainsKey(property.Component) != true)
                {
                    context.Add(SceneDocumentViolationCode.ExposureTargetMissing, $"'{scopeName}' has no component '{property.Component}' to expose '{property.Path}' on.", scopeName);
                }

                continue;
            }

            var grant = grants.Find(instance, property.Component, property.Path);
            if (grant is null || grant.Owner != property.ReExposes)
            {
                context.Add(SceneDocumentViolationCode.ReExposureBroken, $"'{property.ReExposes}' does not expose '{property.Path}' on '{property.Component}' to '{scopeName}', so it cannot be passed on.", scopeName);
            }
            else if (grant.IsWidenedBy(property))
            {
                context.Add(SceneDocumentViolationCode.ExposureWidensOwner, $"'{scopeName}' re-exposes more of '{property.Path}' than '{property.ReExposes}' exposed; only what the owner granted can be passed on.", scopeName);
            }
        }
    }

    static bool Same(ExposedProperty left, ExposedProperty right) =>
        left.Component == right.Component
        && left.Path == right.Path
        && left.Label == right.Label
        && left.ReExposes == right.ReExposes
        && SameSet(left.Operations, right.Operations)
        && SameSet(left.EditableFields, right.EditableFields);

    static bool SameSet<T>(IReadOnlyList<T>? left, IReadOnlyList<T>? right) =>
        left is null || right is null ? left is null && right is null : left.Count == right.Count && left.SequenceEqual(right);
}
