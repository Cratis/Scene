// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Design.Operations;
using Cratis.Scene.Model.Profiles;

namespace Cratis.Scene.Design.AI.Turns;

/// <summary>
/// What a design turn did.
/// </summary>
/// <param name="Succeeded">Whether the turn reached a clean state. A turn that did not changes nothing: it has no events.</param>
/// <param name="Reply">What to say to the person; why the turn could not finish when it did not.</param>
/// <param name="Events">The design session events for the host to append, in order: a revision of each touched screen - sharing the turn's id - variation groups, tweak controls.</param>
/// <param name="Refusals">What the turn would not do, with alternatives.</param>
/// <param name="Proposals">What the design system lacks: tokens, variants and words for the design-system draft, which follows its own review and activation.</param>
/// <param name="Touched">The screens, or screen templates, the turn recorded a revision for.</param>
public record DesignTurnResult(
    bool Succeeded,
    string Reply,
    IReadOnlyList<object> Events,
    IReadOnlyList<DesignTurnRefusal> Refusals,
    IReadOnlyList<DesignSystemProposal> Proposals,
    IReadOnlyList<string> Touched)
{
    /// <summary>
    /// Gets the ui profile the turn changed, for the host to save; <see langword="null"/> when the turn did not change it.
    /// </summary>
    public UiProfile? Profile { get; init; }

    /// <summary>
    /// Creates the result of a turn that could not reach a clean state.
    /// </summary>
    /// <param name="reason">Why.</param>
    /// <returns>The result; it changes nothing.</returns>
    public static DesignTurnResult Failed(string reason) => new(false, reason, [], [], [], []);

    /// <summary>
    /// Gets the result as the canvas's <c language="text">ai.runTurn</c> seam reads it: what the chat shows. The revisions, variation groups and tweak
    /// controls are not in it; the host appends <see cref="Events"/> to the session and the canvas reads them from there.
    /// </summary>
    /// <returns>An object that serializes to it.</returns>
    public object ToWire() => new { reply = Reply, refusals = Refusals, proposals = Proposals, touched = Touched };
}
