// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { GuardCondition, LogicalGuardOperator } from '@cratis/scene.model';
import { GuardToken } from './tokenizeGuardCondition';

/**
 * Reads the tokens of a guard condition into the condition, with `and` binding tighter than `or`.
 */
export class GuardConditionParser {
    private _position = 0;
    private readonly _tokens: GuardToken[];

    constructor(tokens: GuardToken[]) {
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

    private at(offset: number): GuardToken | undefined {
        return this._tokens.at(this._position + offset);
    }

    private atLogical(operator: LogicalGuardOperator): boolean {
        const token = this.at(0);
        return token?.type === 'logical' && token.value === operator;
    }

    private chain(operator: LogicalGuardOperator, next: () => GuardCondition | undefined): GuardCondition | undefined {
        let left = next();
        while (left !== undefined && this.atLogical(operator)) {
            this._position++;
            const right = next();
            if (right === undefined) return undefined;
            left = { kind: 'logical', left, operator, right };
        }
        return left;
    }

    private operand(): GuardCondition | undefined {
        return this.at(0)?.type === 'open' ? this.group() : this.comparison();
    }

    private group(): GuardCondition | undefined {
        this._position++;
        const inner = this.or();
        if (this.at(0)?.type !== 'close') return undefined;
        this._position++;
        return inner;
    }

    private comparison(): GuardCondition | undefined {
        const subject = this.at(0);
        if (subject?.type !== 'path' || !subject.value.startsWith('item.')) return undefined;
        const operator = this.at(1);
        const value = this.at(2);
        if (operator?.type !== 'operator' || value?.type !== 'literal') return undefined;
        this._position += 3;
        return { kind: 'comparison', left: { subject: subject.value }, operator: operator.value, right: value.value };
    }
}
