// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.AI.given;

/// <summary>
/// A progress that reports on the thread that reported, so that a spec reads what was reported when the turn is done.
/// </summary>
/// <typeparam name="T">The type of what is reported.</typeparam>
/// <param name="reported">Where what is reported is kept.</param>
public class SynchronousProgress<T>(List<T> reported) : IProgress<T>
{
    /// <inheritdoc/>
    public void Report(T value) => reported.Add(value);
}
