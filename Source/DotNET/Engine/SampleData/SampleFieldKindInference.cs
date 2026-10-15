// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.SampleData;

namespace Cratis.Scene.Engine.SampleData;

/// <summary>
/// Decides the kind of value to generate for a field. An explicit kind wins; otherwise a field with enum values is an enum, a
/// recognised type decides, and failing that the field's name does (an <c language="csharp">Id</c> suffix, email, phone, company, city,
/// person-like names), with free text as the fallback. A trailing <c language="csharp">?</c> on the type is ignored and type names
/// compare case-insensitively. Identical to the TypeScript engine's <c language="csharp">inferSampleFieldKind</c>.
/// </summary>
public static class SampleFieldKindInference
{
    static readonly Dictionary<string, SampleFieldKind> _typeKinds = new()
    {
        ["guid"] = SampleFieldKind.Id,
        ["uuid"] = SampleFieldKind.Id,
        ["int"] = SampleFieldKind.WholeNumber,
        ["int16"] = SampleFieldKind.WholeNumber,
        ["int32"] = SampleFieldKind.WholeNumber,
        ["int64"] = SampleFieldKind.WholeNumber,
        ["short"] = SampleFieldKind.WholeNumber,
        ["long"] = SampleFieldKind.WholeNumber,
        ["integer"] = SampleFieldKind.WholeNumber,
        ["number"] = SampleFieldKind.WholeNumber,
        ["decimal"] = SampleFieldKind.Amount,
        ["double"] = SampleFieldKind.Amount,
        ["float"] = SampleFieldKind.Amount,
        ["single"] = SampleFieldKind.Amount,
        ["money"] = SampleFieldKind.Amount,
        ["currency"] = SampleFieldKind.Amount,
        ["bool"] = SampleFieldKind.Boolean,
        ["boolean"] = SampleFieldKind.Boolean,
        ["date"] = SampleFieldKind.Date,
        ["dateonly"] = SampleFieldKind.Date,
        ["datetime"] = SampleFieldKind.DateTime,
        ["datetimeoffset"] = SampleFieldKind.DateTime,
        ["timestamp"] = SampleFieldKind.DateTime
    };

    static readonly (string[] Fragments, SampleFieldKind Kind)[] _nameKinds =
    [
        (["email"], SampleFieldKind.Email),
        (["phone", "mobile"], SampleFieldKind.Phone),
        (["company", "organization", "organisation"], SampleFieldKind.Company),
        (["city", "town"], SampleFieldKind.City),
        (["product", "item", "title", "subject", "description"], SampleFieldKind.Text),
        (["name", "customer", "assignee", "owner", "author", "contact", "manager", "employee"], SampleFieldKind.Name)
    ];

    /// <summary>
    /// Infers the kind of value for a field.
    /// </summary>
    /// <param name="field">The field.</param>
    /// <returns>The kind.</returns>
    public static SampleFieldKind Infer(SampleShapeField field)
    {
        if (field.Kind is not null)
        {
            return field.Kind.Value;
        }

        if (field.EnumValues is { Count: > 0 })
        {
            return SampleFieldKind.Enum;
        }

        var type = (field.Type ?? string.Empty).Trim().ToLowerInvariant();
        if (type.EndsWith('?'))
        {
            type = type[..^1];
        }

        if (_typeKinds.TryGetValue(type, out var byType))
        {
            return byType;
        }

        var name = field.Name ?? string.Empty;
        var lower = name.ToLowerInvariant();
        if (lower == "id" || (name.Length > 2 && name.EndsWith("Id", StringComparison.Ordinal)))
        {
            return SampleFieldKind.Id;
        }

        foreach (var (fragments, kind) in _nameKinds)
        {
            if (fragments.Any(fragment => lower.Contains(fragment, StringComparison.Ordinal)))
            {
                return kind;
            }
        }

        return SampleFieldKind.Text;
    }
}
