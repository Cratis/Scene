// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.SampleData;

/// <summary>
/// The value pools and formats generated data draws from for one locale.
/// </summary>
/// <param name="FirstNames">First names.</param>
/// <param name="LastNames">Last names.</param>
/// <param name="Companies">Company names.</param>
/// <param name="Cities">City names.</param>
/// <param name="Domains">Email domains.</param>
/// <param name="PhoneTemplate">The phone number format; <c language="csharp">#</c> is replaced by a random digit.</param>
/// <param name="Words">Words free text is made of.</param>
public record SampleLocale(
    IReadOnlyList<string> FirstNames,
    IReadOnlyList<string> LastNames,
    IReadOnlyList<string> Companies,
    IReadOnlyList<string> Cities,
    IReadOnlyList<string> Domains,
    string PhoneTemplate,
    IReadOnlyList<string> Words);
