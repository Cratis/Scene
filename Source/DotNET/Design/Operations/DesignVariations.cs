// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Nodes;
using Cratis.Scene.Design.Catalogue;

namespace Cratis.Scene.Design.Operations;

/// <summary>
/// Makes layouts of a screen on other templates. The TypeScript twin is <c language="text">makeVariations</c>.
/// </summary>
public static class DesignVariations
{
    static readonly string[] _letters = ["A", "B", "C"];

    /// <summary>
    /// Makes up to three layouts of a screen on other templates. Each keeps what the screen holds where the new template has an outlet that takes it;   what has none is listed. The candidates are screens, not documents: a caller prints them as Screenplay text for the session.
    /// </summary>
    /// <param name="screenName">The screen name.</param>
    /// <param name="templates">The templates.</param>
    /// <param name="workspace">The workspace.</param>
    /// <param name="context">The context.</param>
    /// <returns>The result.</returns>
    public static IReadOnlyList<VariationCandidate> Make(string screenName, IReadOnlyList<string>? templates, DesignWorkspace workspace, DesignContext context)
    {
        var baseScreen = DocumentLookup.FindByName(workspace.Document.Screens, screenName)!;
        var chosen = (templates is { Count: > 0 } ? [.. templates] : DefaultTemplates(baseScreen, context)).Take(DesignLimits.MaximumVariations).ToList();
        List<VariationCandidate> candidates = [];
        for (var index = 0; index < chosen.Count; index++)
        {
            var name = chosen[index];
            var entry = DesignCatalogueLookup.FindTemplate(context.Catalogue, name);
            var source = DocumentLookup.FindByName(workspace.Document.ScreenTemplates, name) ?? DocumentLookup.FindByName(context.Templates, name);
            if (entry is null || source is null)
            {
                continue;
            }

            var slotContent = new Dictionary<string, JsonArray>(StringComparer.Ordinal);
            foreach (var slot in DocumentLookup.SlotNames(source["slots"]))
            {
                slotContent[slot] = [];
            }

            var counts = new Dictionary<string, int>(StringComparer.Ordinal);
            List<string> notCarriedOver = [];
            foreach (var (outlet, elements) in (baseScreen["slotContent"] as JsonObject) ?? [])
            {
                foreach (var element in (elements as JsonArray ?? []).OfType<JsonObject>())
                {
                    var home = HomeOf(element, outlet, entry.Outlets, counts, context);
                    if (home is null || !slotContent.TryGetValue(home, out var holder))
                    {
                        notCarriedOver.Add(DesignMessages.NotCarriedOver(DocumentLookup.Text(element, "id")!, name));
                        continue;
                    }

                    holder.Add(element.DeepClone());
                    counts[home] = counts.GetValueOrDefault(home) + 1;
                }
            }

            var screen = (JsonObject)baseScreen.DeepClone();
            screen["screenTemplate"] = name;
            var content = new JsonObject();
            foreach (var (slot, items) in slotContent)
            {
                content[slot] = items;
            }

            screen["slotContent"] = content;
            candidates.Add(new VariationCandidate(_letters[index], name, JsonSerializer.SerializeToElement(screen), notCarriedOver));
        }

        return candidates;
    }

    /// <summary>
    /// Makes a candidate the screen's layout: the screen takes the candidate's content and template, which joins the document when it is not there.
    /// </summary>
    /// <param name="workspace">The workspace.</param>
    /// <param name="context">The context.</param>
    /// <param name="candidate">The candidate.</param>
    /// <returns>The result.</returns>
    public static DesignWorkspace Choose(DesignWorkspace workspace, DesignContext context, VariationCandidate candidate) =>
        DesignLoweringApplier.ReplaceScreen(
            workspace,
            JsonNode.Parse(candidate.Screen.GetRawText())!.AsObject(),
            DocumentLookup.FindByName(context.Templates, candidate.Template) is { } template ? (JsonObject)template.DeepClone() : null);

    static List<string> DefaultTemplates(JsonObject baseScreen, DesignContext context)
    {
        var baseName = DocumentLookup.Text(baseScreen, "screenTemplate");
        var baseEntry = baseName is null ? null : DesignCatalogueLookup.FindTemplate(context.Catalogue, baseName);
        var others = context.Catalogue.Templates.Where(template => template.Name != baseName).ToList();
        var sameType = others.Where(template => baseEntry?.Type is not null && template.Type == baseEntry.Type).ToList();
        var rest = others.Where(template => !sameType.Contains(template)).ToList();
        return [.. sameType.Concat(rest).Take(DesignLimits.MaximumVariations).Select(template => template.Name)];
    }

    static string? HomeOf(JsonObject element, string from, IReadOnlyList<DesignOutletRule> rules, Dictionary<string, int> counts, DesignContext context)
    {
        var component = DesignCatalogueLookup.FindComponent(context.Catalogue, DocumentLookup.ComponentNameOf(element));
        if (component is null)
        {
            return null;
        }

        bool Room(DesignOutletRule rule) => DesignCatalogueLookup.Accepts(rule, component) && (rule.Max is null || counts.GetValueOrDefault(rule.Name) < rule.Max);
        var preferred = rules.FirstOrDefault(rule => rule.Name == from);
        if (preferred is not null && Room(preferred))
        {
            return preferred.Name;
        }

        return rules.FirstOrDefault(Room)?.Name;
    }
}
