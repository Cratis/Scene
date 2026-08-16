// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Layouts;
using Cratis.Scene.Model.Screens;

namespace Cratis.Scene.Engine.Screens;

/// <summary>
/// Works out how a blueprint's <see cref="ScreenTemplate"/>s nest inside its <see cref="Layout"/>.
/// </summary>
/// <remarks>
/// <para>
/// A template declares only the *name* of the slot it fits, never which container owns that slot. That is
/// what makes templates reusable - a feature's template says "I go in the module content area", not "I go
/// inside this specific module". Resolution is the step that turns those names into a tree, by finding which
/// layout or template declares each name.
/// </para>
/// <para>
/// The same rule applies at every level, so nesting has no depth limit and no separate mechanism per level.
/// The TypeScript twin in <c>@cratis/scene.engine</c> implements the same algorithm; both are asserted
/// against the same shared fixture corpus so they cannot drift apart.
/// </para>
/// </remarks>
public static class ScreenTemplateResolver
{
    /// <summary>
    /// Resolves a set of templates against the layout they live in.
    /// </summary>
    /// <param name="layout">The application layout the templates ultimately sit inside.</param>
    /// <param name="templates">The templates to place.</param>
    /// <returns>The <see cref="ScreenTemplateResolution"/>, carrying the placements and everything that could not be placed.</returns>
    public static ScreenTemplateResolution Resolve(Layout layout, IReadOnlyList<ScreenTemplate> templates)
    {
        var containersBySlot = BuildSlotIndex(layout, templates);
        var parents = new Dictionary<string, string>(StringComparer.Ordinal);
        var slots = new Dictionary<string, string>(StringComparer.Ordinal);
        var unplaced = new List<UnplacedScreenTemplate>();

        foreach (var template in templates)
        {
            if (template.FitsSlot is null)
            {
                continue;
            }

            var (qualifier, slot) = SplitQualifiedSlot(template.FitsSlot);

            var candidates = containersBySlot.TryGetValue(slot, out var found)
                ? found.Where(container => container != template.Name && (qualifier is null || container == qualifier)).ToList()
                : [];

            if (candidates.Count == 1)
            {
                parents[template.Name] = candidates[0];
                slots[template.Name] = slot;
            }
            else
            {
                unplaced.Add(new UnplacedScreenTemplate(template.Name, template.FitsSlot, candidates));
            }
        }

        var cycles = FindCycles(parents);
        var inCycle = new HashSet<string>(cycles.SelectMany(cycle => cycle), StringComparer.Ordinal);

        var placements = new List<ScreenTemplatePlacement>();
        foreach (var template in templates)
        {
            if (!parents.TryGetValue(template.Name, out var container) || inCycle.Contains(template.Name))
            {
                continue;
            }

            placements.Add(new ScreenTemplatePlacement(template.Name, slots[template.Name], container, DepthOf(template.Name, parents, layout.Name)));
        }

        return new ScreenTemplateResolution(
            [.. placements.OrderBy(placement => placement.Depth).ThenBy(placement => placement.Template, StringComparer.Ordinal)],
            unplaced,
            cycles);
    }

    /// <summary>
    /// Splits a <see cref="ScreenTemplate.FitsSlot"/> into the container it names and the slot within it.
    /// </summary>
    /// <param name="fitsSlot">The declared value - bare (<c>body</c>) or container-qualified (<c>ModuleWorkspace.body</c>).</param>
    /// <returns>The qualifier, or <see langword="null"/> when the value is bare, and the slot name.</returns>
    /// <remarks>
    /// The same rule component names use: a bare name searches, a qualified one goes straight to what it
    /// names. A slot called <c>body</c> is a good name at every level of a nesting chain, so several
    /// templates legitimately declare one - and a bare <c>body</c> then has no single answer. Qualifying it
    /// says which, without forcing every slot in an application to carry a unique name.
    /// </remarks>
    static (string? Qualifier, string Slot) SplitQualifiedSlot(string fitsSlot)
    {
        var lastDot = fitsSlot.LastIndexOf('.');
        return lastDot < 0 ? (null, fitsSlot) : (fitsSlot[..lastDot], fitsSlot[(lastDot + 1)..]);
    }

    /// <summary>
    /// Indexes every slot name to the layout and templates declaring it, so a template's <see cref="ScreenTemplate.FitsSlot"/> can be looked up.
    /// </summary>
    /// <param name="layout">The application layout.</param>
    /// <param name="templates">The templates in scope.</param>
    /// <returns>The declaring container names, keyed by slot name, in layout-then-template order.</returns>
    static Dictionary<string, List<string>> BuildSlotIndex(Layout layout, IReadOnlyList<ScreenTemplate> templates)
    {
        var index = new Dictionary<string, List<string>>(StringComparer.Ordinal);

        void Declare(string slot, string container)
        {
            if (!index.TryGetValue(slot, out var containers))
            {
                containers = [];
                index[slot] = containers;
            }

            if (!containers.Contains(container))
            {
                containers.Add(container);
            }
        }

        foreach (var slot in layout.Slots)
        {
            Declare(slot.Name, layout.Name);
        }

        foreach (var template in templates)
        {
            foreach (var slot in template.Slots)
            {
                Declare(slot.Name, template.Name);
            }
        }

        return index;
    }

    /// <summary>
    /// Finds template nesting cycles - a template that transitively contains itself.
    /// </summary>
    /// <param name="parents">Each template's resolved container, keyed by template name.</param>
    /// <returns>Each cycle found, as the templates taking part, recorded once.</returns>
    static List<IReadOnlyList<string>> FindCycles(Dictionary<string, string> parents)
    {
        var cycles = new List<IReadOnlyList<string>>();
        var recorded = new HashSet<string>(StringComparer.Ordinal);

        foreach (var start in parents.Keys.Order(StringComparer.Ordinal))
        {
            var path = new List<string>();
            var onPath = new HashSet<string>(StringComparer.Ordinal);
            var current = start;

            while (parents.TryGetValue(current, out var parent))
            {
                path.Add(current);
                onPath.Add(current);
                if (!onPath.Add(parent))
                {
                    var cycle = path[path.IndexOf(parent)..];
                    var key = string.Join(' ', cycle.Order(StringComparer.Ordinal));
                    if (recorded.Add(key))
                    {
                        cycles.Add(cycle);
                    }

                    break;
                }

                current = parent;
            }
        }

        return cycles;
    }

    /// <summary>
    /// Counts how far below the layout a template sits.
    /// </summary>
    /// <param name="template">The template to measure.</param>
    /// <param name="parents">Each template's resolved container, keyed by template name.</param>
    /// <param name="layoutName">The layout's name, which terminates the walk.</param>
    /// <returns>1 for a template directly inside the layout, 2 for one inside such a template, and so on.</returns>
    static int DepthOf(string template, Dictionary<string, string> parents, string layoutName)
    {
        var depth = 0;
        var current = template;
        while (parents.TryGetValue(current, out var parent) && depth <= parents.Count)
        {
            depth++;
            if (parent == layoutName)
            {
                break;
            }

            current = parent;
        }

        return depth;
    }
}
