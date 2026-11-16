// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Common;

namespace Cratis.Scene.Model.Queries;

/// <summary>
/// The source of one argument of a bound query.
/// </summary>
/// <param name="Parameter">The parameter.</param>
/// <param name="Source">Where the argument comes from.</param>
public record QueryArgumentBinding(
    string Parameter,
    BindingExpression Source);
