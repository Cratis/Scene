// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Bindings;

/// <summary>
/// A binding validation problem that preserves the authored model and tells a designer what to fix.
/// </summary>
/// <param name="Code">The problem code, shared with the TypeScript engine.</param>
/// <param name="Message">What is wrong.</param>
/// <param name="Path">The binding property at fault.</param>
public record BindingDiagnostic(string Code, string Message, string? Path = null);
