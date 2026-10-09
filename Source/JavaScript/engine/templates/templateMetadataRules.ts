// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * Whether a value is an absolute `https` URL with a host - the only kind of link a template browser
 * should follow for attribution or license terms. Kept to plain string rules so the C# twin matches exactly.
 */
export function isAbsoluteHttpsUrl(value: string): boolean {
    const prefix = 'https://';
    return value.startsWith(prefix) && value.length > prefix.length && value[prefix.length] !== '/' && !/\s/.test(value);
}

/**
 * Whether a value is a simple SPDX license expression: identifiers such as `MIT`, `Apache-2.0` or
 * `LicenseRef-Acme`, optionally joined by `AND`, `OR` or `WITH`. Parentheses are not supported.
 */
export function isSpdxExpression(value: string): boolean {
    const tokens = value.split(' ');
    if (tokens.length % 2 === 0) return false;
    return tokens.every((token, index) => (index % 2 === 1 ? ['AND', 'OR', 'WITH'].includes(token) : isSpdxIdentifier(token)));
}

function isSpdxIdentifier(token: string): boolean {
    return token.length > 0 && [...token].every(character => /[A-Za-z0-9.+-]/.test(character));
}
