// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Common;

namespace Cratis.Scene.Model.Forms;

/// <summary>
/// Populates a <see cref="Form"/>'s initial values from an item already in scope (e.g. a row selected in
/// a table on the same screen), rather than a fresh query.
/// </summary>
/// <param name="ItemBinding">The binding to the item already in scope.</param>
public record PopulateFromItem(BindingExpression ItemBinding) : PopulateSource;
