// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Exposure;

namespace Cratis.Scene.Engine.Editing;

/// <summary>
/// What one instance may configure on one property: the owner's exposure, narrowed by every re-exposure between the owner and
/// that instance.
/// </summary>
/// <param name="Component">The id of the component that has the property.</param>
/// <param name="Path">The path of the property.</param>
/// <param name="Owner">The name of the layout or template that exposed it.</param>
/// <param name="Operations">For a collection, what may be done to it.</param>
/// <param name="EditableFields">For a collection, the item fields that may be changed; <see langword="null"/> for all of them.</param>
sealed record ExposureGrant(
    string Component,
    string Path,
    string Owner,
    IReadOnlyList<CollectionOperation> Operations,
    IReadOnlyList<string>? EditableFields)
{
    /// <summary>
    /// Whether handing this on as the given re-exposure would grant more than the owner did.
    /// </summary>
    /// <param name="reExposure">The re-exposure.</param>
    /// <returns><see langword="true"/> when it grants more than this does; otherwise <see langword="false"/>.</returns>
    public bool IsWidenedBy(ExposedProperty reExposure)
    {
        var requested = reExposure.Operations ?? [];
        if (requested.Any(operation => !Operations.Contains(operation)))
        {
            return true;
        }

        return EditableFields is not null && reExposure.EditableFields?.Any(field => !EditableFields.Contains(field)) == true;
    }

    /// <summary>
    /// What remains once the re-exposure has passed it on. Anything the owner did not grant is dropped.
    /// </summary>
    /// <param name="reExposure">The re-exposure.</param>
    /// <returns>The grant that remains.</returns>
    public ExposureGrant Narrow(ExposedProperty reExposure)
    {
        var operations = (reExposure.Operations ?? []).Where(operation => Operations.Contains(operation)).Distinct().ToList();
        var fields = EditableFields is null
            ? reExposure.EditableFields
            : (reExposure.EditableFields is null ? EditableFields : reExposure.EditableFields.Where(EditableFields.Contains).ToList());
        return this with { Operations = operations, EditableFields = fields };
    }
}
