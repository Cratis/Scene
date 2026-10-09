// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Forms;

/// <summary>
/// One column in a command-form geometry grid. Indexes are one-based for authored stability.
/// </summary>
/// <param name="Index">The one-based column index.</param>
/// <param name="Width">The authored column width.</param>
/// <param name="MinWidth">The minimum column width.</param>
/// <param name="MaxWidth">The maximum column width.</param>
public record FormColumn(int Index, FormWidth? Width = null, FormWidth? MinWidth = null, FormWidth? MaxWidth = null);
