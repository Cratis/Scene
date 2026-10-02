// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Exposure;

/// <summary>
/// One property of one component that a layout or template lets what sits inside it configure.
/// </summary>
/// <param name="Component">The id of the component, in the owner, that has the property.</param>
/// <param name="Path">The path of the property on the component.</param>
/// <param name="Label">An optional label the consumer sees instead of the property's own.</param>
/// <param name="Operations">For a collection, the operations the consumer may perform. A collection exposed without any exposes nothing a consumer can change.</param>
/// <param name="EditableFields">For a collection, the item fields the consumer may change, or <see langword="null"/> for all of them.</param>
/// <param name="ReExposes">For a nested template, the owner whose exposure it passes on. A re-exposure can only narrow what that owner granted.</param>
public record ExposedProperty(
    string Component,
    string Path,
    string? Label = null,
    IReadOnlyList<CollectionOperation>? Operations = null,
    IReadOnlyList<string>? EditableFields = null,
    string? ReExposes = null);
