// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Descriptors;
using Cratis.Scene.Model.Exposure;

namespace Cratis.Scene.Engine.Editing.Applying;

/// <summary>
/// What one owner in a chain lets what sits inside it configure of one property.
/// </summary>
/// <param name="Component">The id of the component.</param>
/// <param name="Path">The path of the property.</param>
/// <param name="Descriptor">The descriptor of the property.</param>
/// <param name="Owner">The owner that exposed it.</param>
/// <param name="OwnerLevel">The owner's position in the chain.</param>
/// <param name="Operations">For a collection, what may be done to it.</param>
/// <param name="EditableFields">For a collection, the item fields that may be changed, or <see langword="null"/> for all.</param>
/// <param name="Label">What the consumer sees instead of the property's own label.</param>
sealed record ExposureGrant(
    string Component,
    string Path,
    PropertyDescriptor Descriptor,
    string Owner,
    int OwnerLevel,
    IReadOnlyList<CollectionOperation> Operations,
    IReadOnlyList<string>? EditableFields,
    string? Label);
