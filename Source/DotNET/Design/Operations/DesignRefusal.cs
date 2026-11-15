// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Operations;

/// <summary>
/// Why an operation is not accepted, and the nearest ones that would be.
/// </summary>
/// <param name="Code">One of <see cref="DesignRefusalCode"/>.</param>
/// <param name="Reason">Why, in words.</param>
/// <param name="Alternatives">The nearest operations that would be accepted.</param>
/// <param name="Homes">The outlets that would take the component, when the refusal is about where it goes.</param>
public record DesignRefusal(string Code, string Reason, IReadOnlyList<DesignAlternative> Alternatives, IReadOnlyList<string>? Homes = null)
{
    /// <summary>
    /// Creates a refusal without alternatives.
    /// </summary>
    /// <param name="code">One of <see cref="DesignRefusalCode"/>.</param>
    /// <param name="reason">Why, in words.</param>
    /// <returns>The refusal.</returns>
    public static DesignRefusal Of(string code, string reason) => new(code, reason, []);
}
