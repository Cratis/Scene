// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Operations;

/// <summary>
/// Changes one key of the UI profile.
/// </summary>
/// <param name="Key">The key, one of <see cref="DesignProfileKeys"/>.</param>
/// <param name="Value">The value.</param>
public record ProfileOperation(string Key, string Value) : DesignOperation
{
    /// <inheritdoc/>
    public override string Op => "profile";
}
