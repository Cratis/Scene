// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// The version rule of the shell blueprint: the choices, the selected one and the status.
/// </summary>
/// <param name="Choices">The three choices.</param>
/// <param name="Selected">The choice the stored rule is; <see langword="null"/> when it is a rule of the author's own writing.</param>
/// <param name="Status">What to say about the version.</param>
public record VersionRuleDescription(IReadOnlyList<VersionRuleChoice> Choices, VersionRuleKind? Selected, VersionRuleStatus Status);
