// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { GuardOperator, LogicalGuardOperator } from '@cratis/scene.model';

export type GuardToken =
    | { type: 'path'; value: string }
    | { type: 'literal'; value: string | number | boolean | null }
    | { type: 'operator'; value: GuardOperator }
    | { type: 'logical'; value: LogicalGuardOperator }
    | { type: 'open' }
    | { type: 'close' };

interface Read {
    token: GuardToken;
    end: number;
}

type Reader = (text: string, index: number) => Read | undefined;

// Longer symbols come first so that '>=' is read before '>'.
const symbols: [string, GuardOperator][] = [
    ['==', GuardOperator.Equal],
    ['!=', GuardOperator.NotEqual],
    ['>=', GuardOperator.GreaterThanOrEqual],
    ['<=', GuardOperator.LessThanOrEqual],
    ['>', GuardOperator.GreaterThan],
    ['<', GuardOperator.LessThan],
];

const words: Record<string, GuardToken> = {
    and: { type: 'logical', value: LogicalGuardOperator.And },
    or: { type: 'logical', value: LogicalGuardOperator.Or },
    contains: { type: 'operator', value: GuardOperator.Contains },
    startswith: { type: 'operator', value: GuardOperator.StartsWith },
    true: { type: 'literal', value: true },
    false: { type: 'literal', value: false },
    null: { type: 'literal', value: null },
};

const readParenthesis: Reader = (text, index) => {
    const character = text[index];
    if (character !== '(' && character !== ')') return undefined;
    return { token: { type: character === '(' ? 'open' : 'close' }, end: index + 1 };
};

const readLogicalSymbol: Reader = (text, index) => {
    if (!text.startsWith('&&', index) && !text.startsWith('||', index)) return undefined;
    return { token: { type: 'logical', value: text[index] === '&' ? LogicalGuardOperator.And : LogicalGuardOperator.Or }, end: index + 2 };
};

const readOperatorSymbol: Reader = (text, index) => {
    const symbol = symbols.find(([written]) => text.startsWith(written, index));
    if (symbol === undefined) return undefined;
    return { token: { type: 'operator', value: symbol[1] }, end: index + symbol[0].length };
};

const readQuotedText: Reader = (text, index) => {
    const quote = text[index];
    if (quote !== '"' && quote !== '\'') return undefined;
    let value = '';
    let position = index + 1;
    while (position < text.length && text[position] !== quote) {
        if (text[position] === '\\' && position + 1 < text.length) position++;
        value += text[position];
        position++;
    }
    if (position >= text.length) return undefined;
    return { token: { type: 'literal', value }, end: position + 1 };
};

const readNumber: Reader = (text, index) => {
    const number = /^-?\d+(\.\d+)?/.exec(text.slice(index));
    if (number === null) return undefined;
    return { token: { type: 'literal', value: Number(number[0]) }, end: index + number[0].length };
};

const readWord: Reader = (text, index) => {
    const word = /^[A-Za-z_][A-Za-z0-9_]*(\.[A-Za-z_][A-Za-z0-9_]*)*/.exec(text.slice(index));
    if (word === null) return undefined;
    return { token: words[word[0].toLowerCase()] ?? { type: 'path', value: word[0] }, end: index + word[0].length };
};

const readers: Reader[] = [readParenthesis, readLogicalSymbol, readOperatorSymbol, readQuotedText, readNumber, readWord];

function readToken(text: string, index: number): Read | undefined {
    for (const read of readers) {
        const result = read(text, index);
        if (result !== undefined) return result;
    }
    return undefined;
}

/**
 * Splits the text of a guard condition into tokens.
 * @param text The condition as written.
 * @returns The tokens, or undefined when some of the text is not a token.
 */
export function tokenizeGuardCondition(text: string): GuardToken[] | undefined {
    const tokens: GuardToken[] = [];
    let index = 0;
    while (index < text.length) {
        if (/\s/.test(text[index])) {
            index++;
            continue;
        }
        const read = readToken(text, index);
        if (read === undefined) return undefined;
        tokens.push(read.token);
        index = read.end;
    }
    return tokens;
}
