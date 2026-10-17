// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Profiles;
using Cratis.Scene.Model.Screens;

namespace Cratis.Scene.Engine.Shell;

/// <summary>
/// Where screens put their content in a shell: the templates a screen can be built from and the outlets it uses.
/// </summary>
public static class ShellPlacement
{
    /// <summary>
    /// The screen templates a screen can be built from while a shell is in place: the application's own and those of the installed
    /// blueprints, without the root templates (those are shells, not parts of one). A name the application and a blueprint share is the application's.
    /// </summary>
    /// <param name="profile">The profile whose installed blueprints are searched.</param>
    /// <param name="context">The library (and the rest) the shell is resolved against.</param>
    /// <returns>The templates, in the order own then installed blueprints.</returns>
    public static IReadOnlyList<ScreenTemplate> PlaceableScreenTemplates(UiProfile profile, ShellResolutionContext context)
    {
        var templates = new List<ScreenTemplate>();
        foreach (var source in new[] { context.Library.Own }.Concat(ShellResolver.InstalledBlueprints(profile, context)))
        {
            foreach (var template in source?.ScreenTemplates ?? [])
            {
                if (template.Metadata?.Role != TemplateRole.Root && !templates.Exists(candidate => candidate.Name == template.Name))
                {
                    templates.Add(template);
                }
            }
        }

        return templates;
    }

    /// <summary>
    /// Where a screen template lands in the shell: follows <see cref="ScreenTemplate.FitsSlot"/> from template to containing template until the slot is an
    /// outlet of the shell - qualified with the shell's name, or one no template of the chain declares. A template without a <c language="csharp">FitsSlot</c> is placed
    /// explicitly and has no placement.
    /// </summary>
    /// <param name="templateName">The screen template the chain starts at.</param>
    /// <param name="shellName">The name of the shell the template is placed in.</param>
    /// <param name="templates">The screen templates a screen can be built from (<see cref="PlaceableScreenTemplates"/>).</param>
    /// <returns>The placement, or <see langword="null"/> when the chain is placed explicitly, is cyclic or starts at an unknown template.</returns>
    public static TemplatePlacement? PlacementOf(string templateName, string shellName, IReadOnlyList<ScreenTemplate> templates)
    {
        var current = templates.FirstOrDefault(template => template.Name == templateName);
        var visited = new HashSet<string>(StringComparer.Ordinal);
        while (current is not null && visited.Add(current.Name))
        {
            if (current.FitsSlot is null)
            {
                return null;
            }

            var separator = current.FitsSlot.LastIndexOf('.');
            var qualifier = separator < 0 ? null : current.FitsSlot[..separator];
            var slot = separator < 0 ? current.FitsSlot : current.FitsSlot[(separator + 1)..];
            if (qualifier == shellName)
            {
                return new TemplatePlacement(current.Name, slot, qualifier);
            }

            var self = current;
            var container = templates.FirstOrDefault(template =>
                template != self && (qualifier is null || template.Name == qualifier) && template.Slots.Any(candidate => candidate.Name == slot));
            if (container is null)
            {
                return new TemplatePlacement(current.Name, slot, qualifier);
            }

            current = container;
        }

        return null;
    }

    /// <summary>
    /// The outlets of a shell a screen puts content in: its own slots with content, or the slot its outermost template fits.
    /// </summary>
    /// <param name="screen">The screen.</param>
    /// <param name="shellName">The name of the shell the screen is placed in.</param>
    /// <param name="templates">The screen templates a screen can be built from (<see cref="PlaceableScreenTemplates"/>).</param>
    /// <returns>The outlet names, which may include names the shell does not have.</returns>
    public static IReadOnlyList<string> OutletsUsedBy(Screen screen, string shellName, IReadOnlyList<ScreenTemplate> templates)
    {
        if (screen.ScreenTemplate is null)
        {
            return [.. screen.SlotContent.Where(entry => entry.Value.Count > 0).Select(entry => entry.Key)];
        }

        var placement = PlacementOf(screen.ScreenTemplate, shellName, templates);
        return placement is null ? [] : [placement.Outlet];
    }
}
