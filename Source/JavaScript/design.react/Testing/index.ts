// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

// The fake host the stories mount and a host's own first prototype can start from: an in-memory session, a JSON stand-in for the Screenplay bridge
// and a scripted AI that performs its turns through the real design engine. Published as `@cratis/scene.design.react/testing`.
export * from './createInMemorySessionStore';
export * from './jsonScreenplayBridge';
export * from './scriptedDesignTurns';
export * from './createFakeDesignHost';
export * from './askTheFakeAI';
