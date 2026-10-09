// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Navigation;

/// <summary>
/// One problem with how destinations, outlets and routes fit together.
/// </summary>
/// <param name="Code">What kind of problem this is.</param>
/// <param name="Message">A sentence naming the destinations, outlets or screens involved.</param>
/// <param name="Entry">The entry the problem was found on - its id, or <c language="csharp">#&lt;position&gt;</c> - or <see langword="null"/> for model-wide problems.</param>
public record NavigationDiagnostic(NavigationDiagnosticCode Code, string Message, string? Entry = null);
