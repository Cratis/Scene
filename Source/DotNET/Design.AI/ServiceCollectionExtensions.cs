// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Design.AI;
using Cratis.Scene.Design.AI.DesignSystem;
using Cratis.Scene.Design.AI.Turns;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace Microsoft.Extensions.DependencyInjection;

/// <summary>
/// Extension methods for adding Scene Design with AI to a service collection.
/// </summary>
public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Adds the design turn and the design system turn. They need <c language="csharp">IAIChatClients</c> from Cratis.AI, and the design system turn
    /// an <see cref="IDesignSources"/> the host supplies.
    /// </summary>
    /// <param name="services">The service collection.</param>
    /// <param name="configure">What to change in the options: the purposes, the bounds of a turn.</param>
    /// <returns>The service collection, for chaining.</returns>
    public static IServiceCollection AddSceneDesignAI(this IServiceCollection services, Action<DesignAIOptions>? configure = null)
    {
        var builder = services.AddOptions<DesignAIOptions>();
        if (configure is not null)
        {
            builder.Configure(configure);
        }

        services.TryAddTransient<DesignTurn>();
        services.TryAddTransient<DesignSystemTurn>();
        return services;
    }
}
