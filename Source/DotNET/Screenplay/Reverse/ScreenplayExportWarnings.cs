// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Screenplay.Reverse;

/// <summary>
/// What the canvas holds but the Screenplay document cannot say. The export reports these instead of dropping
/// them silently, so the person exporting knows the document says less than the board does.
/// </summary>
public sealed class ScreenplayExportWarnings
{
    static readonly HashSet<string> _noScopes = [];
    readonly List<string> _warnings = [];
    readonly Dictionary<string, HashSet<string>> _scopes = [with(StringComparer.Ordinal)];

    public IReadOnlyList<string> All => _warnings;

    public int Count => _warnings.Count;

    /// <summary>
    /// What the export is writing while a warning is added (a feature's identity), so a warning that names only a
    /// specification can still be told apart from one for a same-named specification elsewhere.
    /// </summary>
    public string? Scope { get; set; }

    public IReadOnlySet<string> ScopesOf(string warning) => _scopes.TryGetValue(warning, out var scopes) ? scopes : _noScopes;

    public void Add(string warning)
    {
        if (Scope is not null)
        {
            if (!_scopes.TryGetValue(warning, out var scopes))
            {
                _scopes[warning] = scopes = [with(StringComparer.Ordinal)];
            }

            scopes.Add(Scope);
        }

        if (!_warnings.Contains(warning, StringComparer.Ordinal))
        {
            _warnings.Add(warning);
        }
    }

    /// <summary>
    /// Takes back the warnings added after the count was read: they belong to something the export does not write after all.
    /// </summary>
    public void RewindTo(int count)
    {
        while (_warnings.Count > count)
        {
            var warning = _warnings[^1];
            _warnings.RemoveAt(_warnings.Count - 1);
            _scopes.Remove(warning);
        }
    }
}
