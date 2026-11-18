// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

// A Scene document is plain JSON, the same shape the C# bridge writes with JsonObject. It is kept as JSON here
// rather than as the typed Scene model because what travels to a host is the document text, and because the
// document carries members (the native residue among them) that the typed model does not name.
export type JsonValue = string | number | boolean | null | JsonValue[] | { [member: string]: JsonValue };

export type JsonObject = { [member: string]: JsonValue };

export const isJsonObject = (value: JsonValue | undefined): value is JsonObject =>
    typeof value === 'object' && value !== null && !Array.isArray(value);
