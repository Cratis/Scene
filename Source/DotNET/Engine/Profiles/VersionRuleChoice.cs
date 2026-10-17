// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// One choice of version rule.
/// </summary>
/// <param name="Kind">The kind of rule.</param>
/// <param name="Label">The label of the choice.</param>
/// <param name="Description">What the choice does.</param>
/// <param name="Pin">What is stored as the template reference's version.</param>
public record VersionRuleChoice(VersionRuleKind Kind, string Label, string Description, string Pin);
