// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.SampleData;

/// <summary>
/// What kind of value a field holds, as far as generated sample data is concerned. The deterministic
/// generator picks a value pool and a value range from the kind. In documents the member is written in
/// camel case (<c language="csharp">dateTime</c>).
/// </summary>
public enum SampleFieldKind
{
    /// <summary>A stable unique identifier (a UUID).</summary>
    Id = 0,

    /// <summary>A person's full name.</summary>
    Name = 1,

    /// <summary>A company or organization name.</summary>
    Company = 2,

    /// <summary>An email address.</summary>
    Email = 3,

    /// <summary>A phone number in the pack locale's style.</summary>
    Phone = 4,

    /// <summary>A city name from the pack locale.</summary>
    City = 5,

    /// <summary>A short free-text phrase.</summary>
    Text = 6,

    /// <summary>A whole number.</summary>
    WholeNumber = 7,

    /// <summary>A monetary or other two-decimal amount.</summary>
    Amount = 8,

    /// <summary>A true/false value.</summary>
    Boolean = 9,

    /// <summary>A calendar date, <c language="csharp">yyyy-MM-dd</c>.</summary>
    Date = 10,

    /// <summary>A UTC date and time, <c language="csharp">yyyy-MM-ddTHH:mm:ssZ</c>.</summary>
    DateTime = 11,

    /// <summary>One of a fixed set of named values, given by the field's enum values.</summary>
    Enum = 12
}
