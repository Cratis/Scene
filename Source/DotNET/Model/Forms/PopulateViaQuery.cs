// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Common;

namespace Cratis.Scene.Model.Forms;

/// <summary>
/// Populates a <see cref="Form"/>'s initial values from a single typed query, resolved by name.
/// </summary>
/// <param name="QueryName">The resolved name of the query to invoke.</param>
/// <param name="ParameterBindings">Query parameter values, keyed by parameter name.</param>
public record PopulateViaQuery(string QueryName, IReadOnlyDictionary<string, BindingExpression> ParameterBindings) : PopulateSource;
