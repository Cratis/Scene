// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Outlets;

/// <summary>
/// A parameter of a query, written <c language="screenplay">&lt;query&gt;.&lt;parameter&gt;</c> in Screenplay, such as <c language="screenplay">AllProducts.status</c>.
/// </summary>
/// <param name="Query">The name of the query.</param>
/// <param name="Parameter">The name of the parameter.</param>
public record QueryParameterReference(string Query, string Parameter);
