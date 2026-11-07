// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using Cratis.Scene.Engine.Guards;
using Cratis.Scene.Model.Outlets;

namespace Cratis.Scene.Engine.Placement;

/// <summary>
/// Works out whether an action can be used, and why. The TypeScript twin is <c language="csharp">resolveEnablement</c> in
/// <c language="csharp">@cratis/scene.engine</c>; both are asserted against the shared <c language="csharp">placement-fixtures.json</c>.
/// </summary>
/// <remarks>
/// It checks, in order: the subject (an action for an item waits for a selection), the command's authorization (a persona
/// without its policy does not see the action), and the action's <c language="screenplay">enabled when</c> condition. Every check
/// is reported. A blocked authorization hides the action whatever else holds, since the persona never sees it; otherwise the
/// first blocked check disables it. A check that cannot be made here - no persona, or a condition with nothing to evaluate it
/// against - does not hold the action back.
/// </remarks>
public static class EnablementResolver
{
    /// <summary>
    /// Works out whether an action can be used, and why.
    /// </summary>
    /// <param name="request">The action's subject, authorization and condition, and the state they are checked against.</param>
    /// <returns>Whether the action is enabled, disabled or hidden, why, and every check made.</returns>
    public static Enablement Resolve(EnablementRequest request)
    {
        EnablementStep?[] candidates = [SubjectStep(request), AuthorizationStep(request), ConditionStep(request)];
        var steps = candidates.OfType<EnablementStep>().ToList();
        var hidden = steps.Find(step => step.Check == EnablementCheck.Authorization && step.Outcome == EnablementOutcome.Blocked);
        if (hidden is not null)
        {
            return new(EnablementState.Hidden, hidden.Reason, steps);
        }

        var blocked = steps.Find(step => step.Outcome == EnablementOutcome.Blocked);
        return blocked is not null
            ? new(EnablementState.Disabled, blocked.Reason, steps)
            : new(EnablementState.Enabled, "Enabled", steps);
    }

    static EnablementStep? SubjectStep(EnablementRequest request)
    {
        if (request.Subject != OutletSubject.Item)
        {
            return null;
        }

        return request.Selected == true
            ? new(EnablementCheck.Subject, EnablementOutcome.Passed, "An item is selected")
            : new(EnablementCheck.Subject, EnablementOutcome.Blocked, "It is for item, so it waits for a selection");
    }

    static EnablementStep? AuthorizationStep(EnablementRequest request)
    {
        var policy = request.Authorize;
        if (string.IsNullOrEmpty(policy))
        {
            return null;
        }

        var persona = request.Persona;
        if (persona is null)
        {
            return new(EnablementCheck.Authorization, EnablementOutcome.Unchecked, $"The command authorizes with '{policy}', and no persona is given to check it against");
        }

        return persona.Policies.Contains(policy)
            ? new(EnablementCheck.Authorization, EnablementOutcome.Passed, $"{persona.Name} has '{policy}'")
            : new(EnablementCheck.Authorization, EnablementOutcome.Blocked, $"{persona.Name} does not have '{policy}', which the command authorizes with");
    }

    static EnablementStep? ConditionStep(EnablementRequest request)
    {
        if (request.EnabledWhen is null && request.Condition is null && request.ConditionHolds is null)
        {
            return null;
        }

        var expression = request.EnabledWhen ?? "its condition";
        var condition = request.Condition ?? (request.EnabledWhen is null ? null : GuardConditionText.Parse(request.EnabledWhen));
        if (request.ConditionHolds is null && condition is null)
        {
            return new(EnablementCheck.Condition, EnablementOutcome.Unchecked, $"Enabled when {expression}, which Scene cannot read");
        }

        var holds = request.ConditionHolds ?? Evaluate(condition, request.Item);
        if (holds is null)
        {
            return new(EnablementCheck.Condition, EnablementOutcome.Unchecked, $"Enabled when {expression}, which cannot be checked here");
        }

        if (holds.Value)
        {
            return new(EnablementCheck.Condition, EnablementOutcome.Passed, $"{expression} holds");
        }

        var failing = request.ConditionHolds is null && condition is { } written && request.Item is { } item ? NarrowerFailingPart(written, item) : null;
        var what = failing is { } part ? GuardConditionText.Describe(part) : expression;
        return new(EnablementCheck.Condition, EnablementOutcome.Blocked, $"Enabled when {what}, which does not hold");
    }

    /// <summary>
    /// The part of a failing condition that makes it fail, when that is narrower than the whole: the first side of an
    /// <c language="screenplay">and</c> that does not hold.
    /// </summary>
    /// <param name="condition">The condition.</param>
    /// <param name="item">The item it is evaluated against.</param>
    /// <returns>The failing part, or <see langword="null"/> when the whole condition is what fails.</returns>
    static JsonElement? NarrowerFailingPart(JsonElement condition, JsonElement item)
    {
        if (!IsAnd(condition)) return null;
        foreach (var side in new[] { condition.GetProperty("left"), condition.GetProperty("right") })
        {
            if (GuardConditions.Evaluate(side, item) == false) return NarrowerFailingPart(side, item) ?? side;
        }

        return null;
    }

    static bool IsAnd(JsonElement condition) =>
        condition.ValueKind == JsonValueKind.Object
        && condition.TryGetProperty("kind", out var kind) && kind.GetString() == "logical"
        && condition.TryGetProperty("operator", out var @operator) && @operator.GetString() == "And";

    static bool? Evaluate(JsonElement? condition, JsonElement? item) =>
        condition is { } guard && item is { } subject && subject.ValueKind != JsonValueKind.Undefined
            ? GuardConditions.Evaluate(guard, subject)
            : null;
}
