// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * Whether a read model name is a Screenplay identifier, so a sample data binding to it can be exported and read back.
 *
 * This is the ASCII subset of Screenplay's own rule, `[A-Za-z_]\w*` (its `BindingRegex`), and the twin of the C# `ScreenplayIdentifier.IsValid`.
 * Scene matches a binding's target by exact read model name, so a name that fails is never sanitised: it simply cannot be bound.
 *
 * @param name The read model name.
 * @returns `true` when the name is a letter or underscore followed by letters, digits or underscores.
 */
export const isScreenplayIdentifier = (name: string): boolean => /^[A-Za-z_][A-Za-z0-9_]*$/.test(name);
