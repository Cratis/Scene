// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.SampleData;

/// <summary>
/// One field of a <see cref="SampleShape"/>: what the generator needs to know to produce a plausible value.
/// A field gives a <paramref name="Kind"/>, or just a <paramref name="Type"/> (and name) from which the kind is inferred.
/// </summary>
/// <param name="Name">The field's name, as it appears on each row.</param>
/// <param name="Type">The field's type name (<c language="csharp">string</c>, <c language="csharp">Guid</c>, <c language="csharp">int</c>, <c language="csharp">decimal</c> ...); used to infer the kind when <paramref name="Kind"/> is absent.</param>
/// <param name="Kind">The kind of value, overriding what would be inferred from <paramref name="Type"/> and <paramref name="Name"/>.</param>
/// <param name="Nullable">Whether the field may be null. A nullable field is occasionally null in generated data.</param>
/// <param name="EnumValues">The member names of an enum field. Generated values are always one of these.</param>
/// <param name="Min">The smallest value of a numeric field (inclusive).</param>
/// <param name="Max">The largest value of a numeric field (inclusive).</param>
public record SampleShapeField(
    string Name,
    string? Type = null,
    SampleFieldKind? Kind = null,
    bool? Nullable = null,
    IReadOnlyList<string>? EnumValues = null,
    double? Min = null,
    double? Max = null);
