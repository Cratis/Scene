// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Common;

/// <summary>
/// How updates flow between a binding source and target.
/// </summary>
public enum BindingMode
{
    /// <summary>Source changes update the target; target changes are not written back.</summary>
    OneWay = 0,

    /// <summary>Source and target changes flow both directions when both properties declare support.</summary>
    TwoWay = 1,
}
