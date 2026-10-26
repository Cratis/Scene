// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Interactions;

namespace Cratis.Scene.Engine.Bindings;

/// <summary>The entry scope for recursive command-response validation.</summary>
/// <param name="Kind">Either actions or form.</param>
/// <param name="Actions">The ordinary action list, initially without a response.</param>
/// <param name="Command">The form's command name.</param>
/// <param name="OnSubmit">The form's successful continuation.</param>
public record ResponseValidationEntry(string Kind, IReadOnlyList<InteractionAction>? Actions = null, string? Command = null, IReadOnlyList<InteractionAction>? OnSubmit = null);
