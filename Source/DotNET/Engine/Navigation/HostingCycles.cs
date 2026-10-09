// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Navigation;

/// <summary>
/// Finds cycles in a "renders inside" graph, where an edge from a screen to another means the first is placed
/// in an outlet the second one's template owns. Visits screens in the given order and edges in insertion order,
/// matching the TypeScript engine exactly.
/// </summary>
static class HostingCycles
{
    /// <summary>
    /// Finds the cycles, reporting each set of screens once.
    /// </summary>
    /// <param name="screens">The screens in authored order.</param>
    /// <param name="edges">The screens each screen renders inside, in insertion order.</param>
    /// <returns>The cycles, each starting from the screen the walk reached it through.</returns>
    public static IReadOnlyList<IReadOnlyList<string>> Find(IEnumerable<string> screens, IReadOnlyDictionary<string, List<string>> edges)
    {
        var visiting = new HashSet<string>(StringComparer.Ordinal);
        var done = new HashSet<string>(StringComparer.Ordinal);
        var stack = new List<string>();
        var reported = new HashSet<string>(StringComparer.Ordinal);
        var cycles = new List<IReadOnlyList<string>>();

        void Visit(string screen)
        {
            visiting.Add(screen);
            stack.Add(screen);
            foreach (var host in edges.TryGetValue(screen, out var hosts) ? hosts : [])
            {
                if (visiting.Contains(host))
                {
                    var cycle = stack[stack.IndexOf(host)..];
                    if (reported.Add(string.Join('\0', cycle.Order(StringComparer.Ordinal))))
                    {
                        cycles.Add(cycle);
                    }
                }
                else if (!done.Contains(host))
                {
                    Visit(host);
                }
            }

            stack.RemoveAt(stack.Count - 1);
            visiting.Remove(screen);
            done.Add(screen);
        }

        foreach (var screen in screens.Where(screen => !visiting.Contains(screen) && !done.Contains(screen)))
        {
            Visit(screen);
        }

        return cycles;
    }
}
