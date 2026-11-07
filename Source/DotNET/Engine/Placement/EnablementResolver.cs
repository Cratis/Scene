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
        var holds = request.ConditionHolds ?? Evaluate(request.Condition, request.Item);
        return holds switch
        {
            null => new(EnablementCheck.Condition, EnablementOutcome.Unchecked, $"Enabled when {expression}, which cannot be checked here"),
            true => new(EnablementCheck.Condition, EnablementOutcome.Passed, $"{expression} holds"),
            false => new(EnablementCheck.Condition, EnablementOutcome.Blocked, $"Enabled when {expression}, which does not hold"),
        };
    }

    static bool? Evaluate(JsonElement? condition, JsonElement? item) =>
        condition is { } guard && item is { } subject && subject.ValueKind != JsonValueKind.Undefined
            ? GuardConditions.Evaluate(guard, subject)
            : null;
}
