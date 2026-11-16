// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Collections;

namespace Cratis.Scene.Engine.Editing.Applying;

/// <summary>
/// A route into a Scene document: property names (<see cref="string"/>) and array indexes (<see cref="int"/>), outermost first.
/// </summary>
/// <param name="keys">The keys, outermost first.</param>
sealed class DocumentPath(IEnumerable<object> keys) : IReadOnlyList<object>
{
    /// <summary>
    /// Gets the empty path, which addresses the document itself.
    /// </summary>
    public static readonly DocumentPath Empty = new([]);

    readonly object[] _keys = [.. keys];

    /// <inheritdoc/>
    public int Count => _keys.Length;

    /// <inheritdoc/>
    public object this[int index] => _keys[index];

    /// <summary>
    /// Makes a path from keys.
    /// </summary>
    /// <param name="keys">The keys, outermost first.</param>
    /// <returns>The path.</returns>
    public static DocumentPath Of(params object[] keys) => new(keys);

    /// <summary>
    /// Makes a path that goes further down.
    /// </summary>
    /// <param name="keys">The keys to add.</param>
    /// <returns>The longer path.</returns>
    public DocumentPath Append(params object[] keys) => new([.. _keys, .. keys]);

    /// <summary>
    /// Makes a path from the keys after the first ones.
    /// </summary>
    /// <param name="start">How many keys to leave out.</param>
    /// <returns>The remaining path.</returns>
    public DocumentPath Slice(int start) => new(_keys.Skip(start));

    /// <summary>
    /// Makes a path without the last key.
    /// </summary>
    /// <returns>The parent path.</returns>
    public DocumentPath Parent() => new(_keys.Take(_keys.Length - 1));

    /// <summary>
    /// Gets whether this path starts with another one.
    /// </summary>
    /// <param name="prefix">The path to look for.</param>
    /// <returns><see langword="true"/> when every key of the prefix is the same key here.</returns>
    public bool StartsWith(DocumentPath prefix) => prefix._keys.Length <= _keys.Length && prefix._keys.Select((key, position) => key.Equals(_keys[position])).All(same => same);

    /// <inheritdoc/>
    public override bool Equals(object? obj) => obj is DocumentPath other && other._keys.SequenceEqual(_keys);

    /// <inheritdoc/>
    public override int GetHashCode() => _keys.Aggregate(17, (hash, key) => (hash * 31) + key.GetHashCode());

    /// <inheritdoc/>
    public override string ToString() => string.Join('/', _keys);

    /// <inheritdoc/>
    public IEnumerator<object> GetEnumerator() => ((IEnumerable<object>)_keys).GetEnumerator();

    /// <inheritdoc/>
    IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();
}
