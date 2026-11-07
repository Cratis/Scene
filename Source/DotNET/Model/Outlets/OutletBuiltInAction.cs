// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Outlets;

/// <summary>
/// A built-in an action runs instead of a slice or a navigation target, set in <see cref="OutletAction.BuiltIn"/>.
/// </summary>
public enum OutletBuiltInAction
{
    /// <summary>Close the dialog or drawer the action sits in.</summary>
    Close = 0,

    /// <summary>Submit the form of the dialog or drawer the action sits in.</summary>
    Submit = 1,

    /// <summary>Run the queries of the screen again.</summary>
    Refresh = 2,
}
