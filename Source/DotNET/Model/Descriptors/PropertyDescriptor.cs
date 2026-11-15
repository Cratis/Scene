// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using Cratis.Scene.Model.Common;

namespace Cratis.Scene.Model.Descriptors;

/// <summary>
/// Describes one property of a component or a layout type.
/// </summary>
/// <param name="Path">The path of the property.</param>
/// <param name="Label">What the author sees.</param>
/// <param name="Group">The group it is shown under.</param>
/// <param name="ValueType">The kind of value.</param>
/// <param name="Choices">For an enumeration, the allowed values.</param>
/// <param name="Default">The value when none is set.</param>
/// <param name="Constraints">The limits on the value.</param>
/// <param name="EditorKind">The editor to use.</param>
/// <param name="EditorOptions">Options for the editor.</param>
/// <param name="Description">What the property does.</param>
/// <param name="Item">For a collection, what its items look like.</param>
/// <param name="Properties">For an object, its fields.</param>
/// <param name="Open">For an object, whether fields not described are allowed.</param>
/// <param name="ReadOnly">Whether the author cannot change it.</param>
/// <param name="Output">Whether it is produced rather than consumed.</param>
/// <param name="AcceptedBindingKinds">The binding kinds a value may be.</param>
/// <param name="BindingMode">The mode of a binding to it.</param>
public record PropertyDescriptor(
    string Path,
    string Label,
    string Group,
    PropertyValueType ValueType,
    IReadOnlyList<PropertyChoice>? Choices = null,
    JsonElement? Default = null,
    PropertyConstraints? Constraints = null,
    string? EditorKind = null,
    PropertyEditorOptions? EditorOptions = null,
    string? Description = null,
    CollectionItemDescriptor? Item = null,
    IReadOnlyList<PropertyDescriptor>? Properties = null,
    bool? Open = null,
    bool? ReadOnly = null,
    bool? Output = null,
    IReadOnlyList<BindingSourceKind>? AcceptedBindingKinds = null,
    BindingMode? BindingMode = null);
