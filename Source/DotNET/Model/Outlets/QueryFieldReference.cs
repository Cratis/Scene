// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Outlets;

/// <summary>
/// A field of the result of a query, written <c language="screenplay">&lt;query&gt;.&lt;field&gt;</c> in Screenplay, such as <c language="screenplay">ProductStats.drafts</c>.
/// </summary>
/// <param name="Query">The name of the query.</param>
/// <param name="Field">The name of the field.</param>
public record QueryFieldReference(string Query, string Field);
