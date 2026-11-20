// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { describe, expect, it } from 'vitest';
import { decodeSceneDocumentReference, encodeSceneDocument, sceneDocumentReferencePrefix } from '../sceneDocumentReferences';

const reference = (document: string) => sceneDocumentReferencePrefix + encodeSceneDocument(document);

describe('when carrying a document on a reference', () => {
    it('should read back exactly what was carried', () => {
        const document = '{"screens":[{"name":"Screen","slotContent":{"content":[]}}]}';
        expect(decodeSceneDocumentReference(reference(document))).toEqual(document);
    });

    it('should carry text that is not ascii', () => {
        const document = '{"title":"Søk · 日本語 · 🎬"}';
        expect(decodeSceneDocumentReference(reference(document))).toEqual(document);
    });

    it('should carry an empty document', () => expect(decodeSceneDocumentReference(reference(''))).toEqual(''));

    it('should encode without padding, so the reference is one word', () => expect(encodeSceneDocument('abcd')).not.toContain('='));

    it('should encode url-safely, so a reference survives a path', () => {
        const encoded = encodeSceneDocument('ûÿ¾');
        expect(encoded).not.toContain('+');
        expect(encoded).not.toContain('/');
    });

    it('should carry every byte of a document of each length, so no padding is lost', () => {
        for (let length = 0; length < 8; length++) {
            const document = 'x'.repeat(length);
            expect(decodeSceneDocumentReference(reference(document)), `length ${length}`).toEqual(document);
        }
    });
});

describe('when a reference is not one', () => {
    it('should read nothing from a path that is not a reference', () =>
        expect(decodeSceneDocumentReference('Screens/Orders.json')).toBeUndefined());
    it('should read nothing from nothing', () => expect(decodeSceneDocumentReference(undefined)).toBeUndefined());
    it('should read nothing from a reference that is not base64', () =>
        expect(decodeSceneDocumentReference(`${sceneDocumentReferencePrefix}not base64!`)).toBeUndefined());
    it('should read nothing rather than throwing on text that is not utf-8', () =>
        expect(decodeSceneDocumentReference(`${sceneDocumentReferencePrefix}_w`)).toBeUndefined());
    it('should read a file reference node as well as a path', () =>
        expect(decodeSceneDocumentReference({ path: reference('{}') })).toEqual('{}'));
});
