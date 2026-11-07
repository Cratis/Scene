// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { GuardCondition, GuardOperator, LogicalGuardOperator } from '@cratis/scene.model';

type Token =
    | { type: 'path'; value: string }
    | { type: 'literal'; value: string | number | boolean | null }
    | { type: 'operator'; value: GuardOperator }
    | { type: 'logical'; value: LogicalGuardOperator }
    | { type: 'open' }
    | { type: 'close' };

const symbols: [string, GuardOperator][] = [
    ['==', GuardOperator.Equal],
    ['!=', GuardOperator.NotEqual],
    ['>=', GuardOperator.GreaterThanOrEqual],
    ['<=', GuardOperator.LessThanOrEqual],
    ['>', GuardOperator.GreaterThan],
    ['<', GuardOperator.LessThan],
];

const words: Record<string, Token> = {
    and: { type: 'logical', value: LogicalGuardOperator.And },
    or: { type: 'logical', value: LogicalGuardOperator.Or },
    contains: { type: 'operator', value: GuardOperator.Contains },
    startswith: { type: 'operator', value: GuardOperator.StartsWith },
    true: { type: 'literal', value: true },
    false: { type: 'literal', value: false },
    null: { type: 'literal', value: null },
};

function tokenize(text: string): Token[] | undefined {
    const tokens: Token[] = [];
    let index = 0;
    while (index < text.length) {
        const character = text[index];
        if (/\s/.test(character)) {
            index++;
            continue;
        }
        if (character === '(' || character === ')') {
            tokens.push({ type: character === '(' ? 'open' : 'close' });
            index++;
            continue;
        }
        if (text.startsWith('&&', index) || text.startsWith('||', index)) {
            tokens.push({ type: 'logical', value: text[index] === '&' ? LogicalGuardOperator.And : LogicalGuardOperator.Or });
            index += 2;
            continue;
        }
        const symbol = symbols.find(([written]) => text.startsWith(written, index));
        if (symbol !== undefined) {
            tokens.push({ type: 'operator', value: symbol[1] });
            index += symbol[0].length;
            continue;
        }
        if (character === '"' || character === '\'') {
            let value = '';
            index++;
            while (index < text.length && text[index] !== character) {
                if (text[index] === '\\' && index + 1 < text.length) index++;
                value += text[index];
                index++;
            }
            if (index >= text.length) return undefined;
            index++;
            tokens.push({ type: 'literal', value });
            continue;
        }
        const number = /^-?\d+(\.\d+)?/.exec(text.slice(index));
        if (number !== null) {
            tokens.push({ type: 'literal', value: Number(number[0]) });
            index += number[0].length;
            continue;
        }
        const word = /^[A-Za-z_][A-Za-z0-9_]*(\.[A-Za-z_][A-Za-z0-9_]*)*/.exec(text.slice(index));
        if (word === null) return undefined;
        tokens.push(words[word[0].toLowerCase()] ?? { type: 'path', value: word[0] });
        index += word[0].length;
    }
    return tokens;
}

class Parser {
    private _position = 0;
    private readonly _tokens: Token[];

    constructor(tokens: Token[]) {
        this._tokens = tokens;
    }

    get done(): boolean {
        return this._position === this._tokens.length;
    }

    or(): GuardCondition | undefined {
        return this.chain(LogicalGuardOperator.Or, () => this.and());
    }

    and(): GuardCondition | undefined {
        return this.chain(LogicalGuardOperator.And, () => this.operand());
    }

    private chain(operator: LogicalGuardOperator, next: () => GuardCondition | undefined): GuardCondition | undefined {
        let left = next();
        while (left !== undefined) {
            const token = this._tokens.at(this._position);
            if (token?.type !== 'logical' || token.value !== operator) break;
            this._position++;
            const right = next();
            if (right === undefined) return undefined;
            left = { kind: 'logical', left, operator, right };
        }
        return left;
    }

    private operand(): GuardCondition | undefined {
        const token = this._tokens.at(this._position);
        if (token?.type === 'open') {
            this._position++;
            const inner = this.or();
            if (this._tokens.at(this._position)?.type !== 'close') return undefined;
            this._position++;
            return inner;
        }
        const subject = this._tokens.at(this._position);
        const operator = this._tokens.at(this._position + 1);
        const value = this._tokens.at(this._position + 2);
        if (subject?.type !== 'path' || !subject.value.startsWith('item.') || operator?.type !== 'operator' || value?.type !== 'literal') return undefined;
        this._position += 3;
        return { kind: 'comparison', left: { subject: subject.value }, operator: operator.value, right: value.value };
    }
}

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
    const tokens = tokenize(text);
    if (tokens === undefined || tokens.length === 0) return undefined;
    const parser = new Parser(tokens);
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
