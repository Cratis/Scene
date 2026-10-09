// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Forms;

/// <summary>
/// A platform-neutral width value for form geometry.
/// </summary>
/// <param name="Unit">The width unit.</param>
/// <param name="Value">The numeric value for fraction, pixel and percent widths. Null for automatic width.</param>
public record FormWidth(FormWidthUnit Unit, double? Value = null);
