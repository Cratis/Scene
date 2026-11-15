// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Session;

/// <summary>
/// One layout offered by a variation group.
/// </summary>
/// <param name="Id">Its id.</param>
/// <param name="Text">The Screenplay text.</param>
public record ProposedVariation(string Id, string Text);
