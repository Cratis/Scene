// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Session;

/// <summary>
/// Layouts of a screen asked for together. Choosing one makes it the screen's next revision; the others stay in the history.
/// </summary>
/// <param name="Id">Its id.</param>
/// <param name="Screen">The screen.</param>
/// <param name="Candidates">The layouts offered.</param>
/// <param name="Prompt">What was asked for.</param>
/// <param name="Chosen">The id of the candidate that was chosen.</param>
public record VariationGroup(string Id, string Screen, IReadOnlyList<VariationCandidateRecord> Candidates, string? Prompt = null, string? Chosen = null);
