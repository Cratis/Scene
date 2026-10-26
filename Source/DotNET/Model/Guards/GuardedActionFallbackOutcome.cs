// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Serialization;

namespace Cratis.Scene.Model.Guards;

/// <summary>
/// What an action does when no alternative matches.
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter<GuardedActionFallbackOutcome>))]
public enum GuardedActionFallbackOutcome
{
    /// <summary>
    /// Hide the action.
    /// </summary>
    Hidden = 0,

    /// <summary>
    /// Execute the fallback command.
    /// </summary>
    Execute = 1
}
