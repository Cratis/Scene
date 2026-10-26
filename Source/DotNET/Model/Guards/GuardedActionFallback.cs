// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Guards;

/// <summary>
/// The action used when no alternative matches.
/// </summary>
/// <param name="Outcome">Whether to hide or execute.</param>
/// <param name="Command">The fallback command, when executable.</param>
/// <param name="Arguments">Explicit subject input bindings.</param>
public record GuardedActionFallback(GuardedActionFallbackOutcome Outcome, string? Command = null, IReadOnlyDictionary<string, SubjectReference>? Arguments = null);
