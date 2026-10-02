// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Exposure;

namespace Cratis.Scene.Engine.Editing;

/// <summary>
/// Compares the items an instance holds in an exposed collection with the ones it held before, and requires that every kind of
/// change be one the owner granted: adding items, removing them, reordering the ones that stayed, and changing their fields. Only
/// the fields the owner left editable may be set at all, on a new item as on an old one.
/// </summary>
static class CollectionChange
{
    /// <summary>
    /// Checks the change to one collection.
    /// </summary>
    /// <param name="context">The check being made.</param>
    /// <param name="grant">What the scope may do to the collection.</param>
    /// <param name="now">The items the scope holds in it now.</param>
    /// <param name="before">The items it held before.</param>
    /// <param name="ownerItemIds">The ids of the items the owner put in the collection itself.</param>
    public static void Check(ChangeContext context, ExposureGrant grant, IReadOnlyList<ContributedItem> now, IReadOnlyList<ContributedItem> before, HashSet<string> ownerItemIds)
    {
        var scope = context.Scope.Describe();
        var subject = context.Scope.Instance();
        var where = $"'{grant.Path}' on '{grant.Component}'";
        var beforeById = before.GroupBy(item => item.Id).ToDictionary(group => group.Key, group => group.First());

        var repeated = now.GroupBy(item => item.Id).Where(group => group.Count() > 1).Select(group => group.Key)
            .Concat(now.Where(item => ownerItemIds.Contains(item.Id)).Select(item => item.Id))
            .Distinct();
        foreach (var id in repeated)
        {
            context.Add(SceneDocumentViolationCode.DuplicateCollectionItem, $"The item id '{id}' in {where} is already used.", subject);
        }

        var added = now.Where(item => !beforeById.ContainsKey(item.Id)).ToList();
        var removed = before.Where(item => now.All(candidate => candidate.Id != item.Id)).ToList();
        var kept = now.Where(item => beforeById.ContainsKey(item.Id)).ToList();

        Require(context, grant, CollectionOperation.Add, added.Count > 0, $"{scope} added items to {where}, but adding items is not exposed.");
        Require(context, grant, CollectionOperation.Remove, removed.Count > 0, $"{scope} removed items from {where}, but removing items is not exposed.");

        var edited = kept.FindAll(item => ChangedFields(item, beforeById[item.Id]).Count != 0);
        Require(context, grant, CollectionOperation.EditFields, edited.Count > 0, $"{scope} changed the fields of items in {where}, but editing fields is not exposed.");

        var order = kept.ConvertAll(item => item.Id);
        var orderBefore = before.Where(item => order.Contains(item.Id)).Select(item => item.Id).ToList();
        Require(context, grant, CollectionOperation.Reorder, !order.SequenceEqual(orderBefore), $"{scope} reordered items in {where}, but reordering items is not exposed.");

        var fields = added.SelectMany(item => item.Values.Keys).Concat(edited.SelectMany(item => ChangedFields(item, beforeById[item.Id]))).Distinct();
        foreach (var field in fields.Where(field => grant.EditableFields?.Contains(field) == false))
        {
            context.Add(SceneDocumentViolationCode.ContributionOperationNotPermitted, $"The field '{field}' of {where} is not exposed for editing.", subject);
        }
    }

    static void Require(ChangeContext context, ExposureGrant grant, CollectionOperation operation, bool done, string message)
    {
        if (done && !grant.Operations.Contains(operation))
        {
            context.Add(SceneDocumentViolationCode.ContributionOperationNotPermitted, message, context.Scope.Instance());
        }
    }

    static List<string> ChangedFields(ContributedItem now, ContributedItem before) =>
        [.. now.Values.Keys.Concat(before.Values.Keys).Distinct().Where(field =>
            !JsonData.DeepEquals(now.Values.TryGetValue(field, out var current) ? current : null, before.Values.TryGetValue(field, out var previous) ? previous : null))];
}
