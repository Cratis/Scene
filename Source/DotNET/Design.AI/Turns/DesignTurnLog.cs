// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Microsoft.Extensions.Logging;

namespace Cratis.Scene.Design.AI.Turns;

/// <summary>
/// The log messages of <see cref="DesignTurn"/>.
/// </summary>
internal static partial class DesignTurnLog
{
    [LoggerMessage(LogLevel.Warning, "Design turn {TurnId} could not open the design: {Problem}")]
    internal static partial void CannotOpenTheDesign(this ILogger<DesignTurn> logger, string turnId, string problem);

    [LoggerMessage(LogLevel.Error, "Design turn {TurnId} failed in the model")]
    internal static partial void TheModelFailed(this ILogger<DesignTurn> logger, string turnId, Exception exception);

    [LoggerMessage(LogLevel.Information, "Design turn {TurnId} gave up after refused writes: {Problem}")]
    internal static partial void GaveUp(this ILogger<DesignTurn> logger, string turnId, string problem);

    [LoggerMessage(LogLevel.Information, "Design turn {TurnId} did not finish within {Iterations} iterations")]
    internal static partial void RanOutOfIterations(this ILogger<DesignTurn> logger, string turnId, int iterations);
}
