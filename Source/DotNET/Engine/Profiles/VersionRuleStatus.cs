// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// The status chip of a version rule.
/// </summary>
/// <param name="Tone">How the chip is coloured.</param>
/// <param name="Text">The chip text.</param>
public record VersionRuleStatus(VersionRuleTone Tone, string Text);
