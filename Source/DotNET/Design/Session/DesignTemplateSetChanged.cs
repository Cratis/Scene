// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Chronicle.Events;

namespace Cratis.Scene.Design.Session;

/// <summary>
/// The templates a session may use changed; empty lifts the constraint.
/// </summary>
/// <param name="TemplateSet">The templates it may use now; empty lifts the constraint.</param>
[EventType]
public record DesignTemplateSetChanged(IReadOnlyList<string> TemplateSet);
