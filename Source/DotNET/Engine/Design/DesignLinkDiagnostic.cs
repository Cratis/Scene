// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Design;

/// <summary>
/// One mismatch between a design system and the components that render it. Never silent: a host shows every one.
/// </summary>
/// <param name="Code">What is wrong.</param>
/// <param name="DesignComponent">The design-system component.</param>
/// <param name="Member">The part, variant or state at fault, or <see langword="null"/> when the whole component is.</param>
/// <param name="Message">The message, ready to show.</param>
public record DesignLinkDiagnostic(DesignLinkDiagnosticCode Code, string DesignComponent, string? Member, string Message);
