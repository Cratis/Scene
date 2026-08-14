// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Layouts;

/// <summary>
/// How a <see cref="Slot"/>'s content is arranged: <see cref="FlowArrangement"/> (reflowing, computed per
/// size class) or <see cref="FreeformArrangement"/> (one placement variant per size class).
/// </summary>
public abstract record Arrangement;
