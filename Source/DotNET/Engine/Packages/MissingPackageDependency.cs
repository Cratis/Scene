// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Packages;

/// <summary>
/// A dependency a selected package declares that nothing in the catalog can satisfy - so it cannot be
/// pulled in automatically, and the selection is genuinely incomplete rather than merely under-specified.
/// </summary>
/// <param name="Package">The package that declares the dependency.</param>
/// <param name="DependsOn">The name of the package it depends on, which the catalog does not contain.</param>
public record MissingPackageDependency(string Package, string DependsOn);
