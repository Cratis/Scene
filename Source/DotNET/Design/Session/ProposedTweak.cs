// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Design.Operations;

namespace Cratis.Scene.Design.Session;

/// <summary>
/// One tweak control offered.
/// </summary>
/// <param name="Id">Its id.</param>
/// <param name="Label">What it is called.</param>
/// <param name="Kind">Either <c language="text">hue</c> or <c language="text">choice</c>.</param>
/// <param name="Address">What it writes.</param>
/// <param name="Options">The choices it offers.</param>
public record ProposedTweak(string Id, string Label, string Kind, TweakAddress Address, IReadOnlyList<string>? Options = null);
