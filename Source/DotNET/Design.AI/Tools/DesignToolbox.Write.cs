// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.ComponentModel;
using System.Text.Json;
using Cratis.Scene.Design.AI.Turns;
using Cratis.Scene.Design.AI.Workbench;
using Cratis.Scene.Design.Operations;

namespace Cratis.Scene.Design.AI.Tools;

/// <summary>
/// The write tools of the toolbox.
/// </summary>
internal sealed partial class DesignToolbox
{
    [Description("Writes a whole screen (or screen template, in template mode) as Screenplay: the way a screen is created. The text declares exactly one `screen <Name>` and may declare the shapes it needs before it. It is compiled together with the application's Screenplay and checked against the catalogue; the answer says what is wrong, and when anything is, nothing was changed. A screen of that name is replaced.")]
    string WriteScreen([Description("The Screenplay text of one screen.")] string text)
    {
        progress?.Report(DesignTurnProgress.Status("Writing a screen"));
        return Answer(workbench.WriteScreen(text));
    }

    [Description("Applies design operations to the design: edits, new screens, links, the profile. They are applied together or not at all; the answer says what happened to each, and when one is refused nothing was changed, with the alternatives that would be accepted.")]
    string ApplyOperations([Description("An array of operations, each an object with an `op`, as the instructions describe them.")] JsonElement operations)
    {
        progress?.Report(DesignTurnProgress.Status("Changing the design"));
        List<DesignOperation>? parsed;
        try
        {
            parsed = operations.ValueKind == JsonValueKind.Array
                ? operations.Deserialize<List<DesignOperation>>(DesignJson.Options)
                : operations.ValueKind == JsonValueKind.Object ? [operations.Deserialize<DesignOperation>(DesignJson.Options)!] : null;
        }
        catch (JsonException exception)
        {
            return Answer(workbench.Rejected($"The operations could not be read: {exception.Message}"));
        }

        return parsed is null or [] ? Answer(workbench.Rejected("Give an array of operations.")) : Answer(workbench.ApplyOperations(parsed));
    }

    [Description("Offers up to three variations of a screen for a person to choose from: the same screen laid out on other screen templates, and/or whole candidates written as Screenplay that each declare that screen. Nothing changes until one is chosen.")]
    string ProposeVariations(
        [Description("The screen.")] string screen,
        [Description("The screen templates to lay it out on.")] string[]? templates = null,
        [Description("Candidates written as Screenplay, each declaring exactly that screen.")] string[]? candidates = null)
    {
        progress?.Report(DesignTurnProgress.Status($"Making variations of {screen}"));
        return Answer(workbench.ProposeVariations(screen, templates, candidates));
    }

    [Description("Offers up to five tweak controls a person can move without asking again, bound to something the design has: a key of the profile, or a choice property of an element.")]
    string ProposeTweaks([Description("An array of controls: {\"label\", \"kind\": \"hue\"|\"choice\", \"address\": {\"kind\": \"profile\", \"key\"} or {\"kind\": \"property\", \"screen\", \"element\", \"prop\"}, \"options\": [...]}.")] JsonElement controls)
    {
        progress?.Report(DesignTurnProgress.Status("Offering tweaks"));
        try
        {
            var parsed = controls.ValueKind == JsonValueKind.Array ? controls.Deserialize<List<TweakControl>>(DesignJson.Options) : null;
            return parsed is null or [] ? Answer(workbench.Rejected("Give an array of controls.")) : Answer(workbench.ProposeTweaks(parsed));
        }
        catch (JsonException exception)
        {
            return Answer(workbench.Rejected($"The controls could not be read: {exception.Message}"));
        }
    }

    [Description("Proposes what the design system lacks - a token, a variant of a component, a word, a template - to its draft. The canvas never changes the design system itself: the proposal is reviewed like any other change to it.")]
    string ProposeDesignSystemChange(
        [Description("What it is: token, variant, word, template or component.")] string kind,
        [Description("In a sentence, what it adds and why.")] string summary,
        [Description("The address, for a token or a word, such as tokens.color.accent or words.voice.tone.")] string? address = null,
        [Description("The component, for a variant.")] string? component = null,
        [Description("The variant, for a variant.")] string? variant = null,
        [Description("The value proposed, when it has one.")] string? value = null)
    {
        progress?.Report(DesignTurnProgress.Status("Proposing to the design system"));
        return Answer(workbench.ProposeDesignSystemChange(new DesignSystemProposal(kind, summary, address, component, variant, value)));
    }

    [Description("Ends the turn. Call it when the design is what was asked for, or when you have refused or have nothing to change.")]
    string Finish([Description("What to say to the person: one or two plain sentences, no lists, no element ids.")] string reply)
    {
        workbench.Finish(reply);
        progress?.Report(DesignTurnProgress.Reply(reply));
        ToolLoop.End();
        return Json(new { finished = true });
    }

    string Answer(WriteOutcome outcome)
    {
        if (outcome.Applied)
        {
            foreach (var screen in outcome.Touched)
            {
                progress?.Report(DesignTurnProgress.Screen(screen));
            }
        }
        else if (workbench.Abandoned)
        {
            ToolLoop.End();
        }

        return Json(new
        {
            applied = outcome.Applied,
            summary = outcome.Summary,
            diagnostics = outcome.Diagnostics,
            operations = outcome.Outcomes?.Select(operation => new
            {
                op = operation.Operation.Op,
                applied = operation.Applied,
                summary = operation.Summary,
                code = operation.Code,
                reason = operation.Reason,
                alternatives = operation.Alternatives,
                variations = operation.Variations?.Select(variation => new { variation.Letter, variation.Template }),
                controls = operation.Controls
            }),
            changed = outcome.Touched
        });
    }
}
