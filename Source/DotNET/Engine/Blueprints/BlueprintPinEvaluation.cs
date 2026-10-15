// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Blueprints;

/// <summary>
/// The outcome of evaluating a pin.
/// </summary>
/// <param name="Status">Where the pin stands.</param>
/// <param name="Pin">The pin that was evaluated: the one given, or the default for the installed version when none was.</param>
/// <param name="Message">Said in a sentence, for a tooltip or a diagnostic.</param>
public record BlueprintPinEvaluation(BlueprintPinStatus Status, string Pin, string Message);
