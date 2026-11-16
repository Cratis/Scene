// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Operations;

/// <summary>
/// Says no, with the reason and what to do instead.
/// </summary>
/// <param name="Code">Why, as one of <see cref="DesignRefusalCode"/>.</param>
/// <param name="Reason">Why, in words.</param>
/// <param name="Alternatives">What to do instead.</param>
public record RefuseOperation(string Code, string Reason, IReadOnlyList<DesignAlternative>? Alternatives = null) : DesignOperation
{
    /// <inheritdoc/>
    public override string Op => "refuse";
}
