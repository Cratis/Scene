// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { GuardCondition, GuardOperator, LogicalGuardOperator } from '@cratis/scene.model';
import { GuardConditionParser } from './GuardConditionParser';
import { tokenizeGuardCondition } from './tokenizeGuardCondition';

/**
 * Reads a condition as Screenplay writes it after `enabled when`, such as `item.status == "onSale" and item.stock > 0`,
 * into the guard condition Scene evaluates. A comparison is an `item.` path, an operator (`==`, `!=`, `>`, `>=`, `<`,
 * `<=`, `contains` or `startsWith`) and a literal (a quoted text, a number, `true`, `false` or `null`); comparisons join
 * with `and` (`&&`), which binds tighter than `or` (`||`), and group in parentheses. The C# engine's
 * `GuardConditionText.Parse` reads the same text; both are asserted against `placement-fixtures.json`.
 * @param text The condition as written.
 * @returns The guard condition, or undefined when the text is not a condition Scene can read.
 */
export function parseGuardCondition(text: string): GuardCondition | undefined {
    const tokens = tokenizeGuardCondition(text);
    if (tokens === undefined || tokens.length === 0) return undefined;
    const parser = new GuardConditionParser(tokens);
    const condition = parser.or();
    return condition !== undefined && parser.done ? condition : undefined;
}

const written: Record<string, string> = {
    [GuardOperator.Equal]: '==',
    [GuardOperator.NotEqual]: '!=',
    [GuardOperator.GreaterThan]: '>',
    [GuardOperator.GreaterThanOrEqual]: '>=',
    [GuardOperator.LessThan]: '<',
    [GuardOperator.LessThanOrEqual]: '<=',
    [GuardOperator.Contains]: 'contains',
    [GuardOperator.StartsWith]: 'startsWith',
};

/**
 * Writes a guard condition the way Screenplay writes it after `enabled when`, such as `item.stock > 0`.
 * @param condition The condition.
 * @returns The condition as text.
 */
export function describeGuardCondition(condition: GuardCondition): string {
    if (condition.kind === 'comparison') {
        const right = typeof condition.right === 'string' ? JSON.stringify(condition.right) : String(condition.right);
        return `${condition.left.subject} ${written[condition.operator] ?? condition.operator} ${right}`;
    }
    const side = (part: GuardCondition) =>
        condition.operator === LogicalGuardOperator.And && part.kind === 'logical' && part.operator === LogicalGuardOperator.Or
            ? `(${describeGuardCondition(part)})`
            : describeGuardCondition(part);
    return `${side(condition.left)} ${condition.operator === LogicalGuardOperator.And ? 'and' : 'or'} ${side(condition.right)}`;
}
