// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { FileReferenceSyntax } from './Syntax/ScreenplaySyntax';

// The mirror of ScreenplaySceneDocumentReferences: a Scene document carried verbatim inside a .play document, as
// base64url behind a prefix that says what it is.
export const sceneDocumentReferencePrefix = 'studio-scene-document:v1:';

export const containsSceneDocumentReference = (source: string): boolean => source.includes(sceneDocumentReferencePrefix);

export const encodeSceneDocument = (document: string): string =>
    base64(new TextEncoder().encode(document)).replace(/=+$/, '').replaceAll('+', '-').replaceAll('/', '_');

// The document a reference carries, or nothing when the reference is not one or does not decode. A malformed
// reference is never an error here: the screen simply has no preserved document and the typed conversion decides.
export const decodeSceneDocumentReference = (file: FileReferenceSyntax | string | null | undefined): string | undefined => {
    const path = typeof file === 'string' ? file : file?.path;
    if (path === undefined || !path.startsWith(sceneDocumentReferencePrefix)) return undefined;
    return decode(path.slice(sceneDocumentReferencePrefix.length));
};

const decode = (value: string): string | undefined => {
    const padded = value.replaceAll('-', '+').replaceAll('_', '/');
    const full = padded.padEnd(padded.length + ((4 - (padded.length % 4)) % 4), '=');
    try {
        return new TextDecoder('utf-8', { fatal: true }).decode(bytes(full));
    } catch {
        return undefined;
    }
};

// Base64 without assuming a Node or a browser global: the package runs in a VS Code webview, in a browser and in
// a Node process, and only one of those has Buffer.
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

const base64 = (input: Uint8Array): string => {
    let result = '';
    for (let index = 0; index < input.length; index += 3) {
        const chunk = (input[index] << 16) | ((input[index + 1] ?? 0) << 8) | (input[index + 2] ?? 0);
        result += alphabet[(chunk >> 18) & 63] + alphabet[(chunk >> 12) & 63] +
            (index + 1 < input.length ? alphabet[(chunk >> 6) & 63] : '=') +
            (index + 2 < input.length ? alphabet[chunk & 63] : '=');
    }
    return result;
};

const bytes = (input: string): Uint8Array => {
    const body = input.replace(/=+$/, '');
    const out = new Uint8Array(Math.floor((body.length * 6) / 8));
    let bits = 0;
    let accumulated = 0;
    let written = 0;
    for (const character of body) {
        const value = alphabet.indexOf(character);
        if (value < 0) throw new Error('not base64');
        accumulated = (accumulated << 6) | value;
        bits += 6;
        if (bits >= 8) {
            bits -= 8;
            out[written++] = (accumulated >> bits) & 0xff;
        }
    }
    if (written !== out.length) throw new Error('not base64');
    return out;
};
