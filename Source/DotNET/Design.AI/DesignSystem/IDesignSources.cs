// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.AI.DesignSystem;

/// <summary>
/// Defines the seam through which a host supplies what a design system is established from. Direct gathers files from the repositories of a product, the
/// brand files a person uploaded and captures of the running app; Studio gathers the project's and what is uploaded to it.
/// </summary>
public interface IDesignSources
{
    /// <summary>
    /// Gathers the sources.
    /// </summary>
    /// <param name="request">What they are gathered for.</param>
    /// <param name="cancellationToken">A token to cancel it.</param>
    /// <returns>The sources, and what could not be read.</returns>
    Task<DesignSourceSet> Gather(DesignSourcesRequest request, CancellationToken cancellationToken);
}
