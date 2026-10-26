// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Guards;

/// <summary>
/// One ordered guarded command choice.
/// </summary>
/// <param name="Command">The command to execute.</param>
/// <param name="Condition">The predicate selecting this command.</param>
/// <param name="Arguments">Explicit subject input bindings.</param>
public record GuardedActionAlternative(string Command, GuardCondition Condition, IReadOnlyDictionary<string, SubjectReference>? Arguments = null);
