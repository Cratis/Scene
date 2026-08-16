// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * The name this blueprint is known by inside a `ui profile`.
 *
 * It is not the npm package name: a profile lists Scene package names, a `PackageDependency` refers to
 * one, and `componentRegistryKey` builds every registry key from this. It therefore lives on its own
 * rather than inside the manifest, so the registry can key off it without importing the manifest that
 * describes the registry.
 */
export const componentsBlueprintName = 'Cratis.Blueprint.Components';
