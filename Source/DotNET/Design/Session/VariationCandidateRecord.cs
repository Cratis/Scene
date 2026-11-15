// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Session;

/// <summary>
/// One layout a variation group offered, as Screenplay text.
/// </summary>
/// <param name="Id">Its id.</param>
/// <param name="Text">The Screenplay text.</param>
public record VariationCandidateRecord(string Id, string Text);
