// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Navigation;

namespace Cratis.Scene.Engine.Navigation;

/// <summary>
/// The result of applying navigation edits. Either every edit applies, or none does and <paramref name="Model"/> is the model given.
/// </summary>
/// <param name="Applied">Whether every edit was applied.</param>
/// <param name="Model">The model after the edits; the model given when they were not applied.</param>
/// <param name="Rejected">Why the edits were refused; <see langword="null"/> when they were applied.</param>
public record NavigationEditOutcome(bool Applied, NavigationModel Model, string? Rejected = null);
