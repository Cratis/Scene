// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Microsoft.Extensions.Logging;

namespace Cratis.Scene.Design.AI.DesignSystem;

/// <summary>
/// The log messages of <see cref="DesignSystemTurn"/>.
/// </summary>
internal static partial class DesignSystemTurnLog
{
    [LoggerMessage(LogLevel.Error, "The design system turn failed in the model")]
    internal static partial void TheModelFailed(this ILogger<DesignSystemTurn> logger, Exception exception);

    [LoggerMessage(LogLevel.Information, "The design system turn gave up after refused writes: {Problem}")]
    internal static partial void GaveUp(this ILogger<DesignSystemTurn> logger, string problem);

    [LoggerMessage(LogLevel.Information, "The design system turn did not finish within {Iterations} iterations")]
    internal static partial void RanOutOfIterations(this ILogger<DesignSystemTurn> logger, int iterations);
}
