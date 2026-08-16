// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Packages;

/// <summary>
/// A dependency that resolved to a package the catalog does contain, but at a version its declared
/// range does not accept.
/// </summary>
/// <param name="Package">The package that declares the dependency.</param>
/// <param name="DependsOn">The name of the package it depends on.</param>
/// <param name="RequiredRange">The range <see cref="Package"/> asked for.</param>
/// <param name="ActualVersion">The version the catalog actually offers.</param>
public record PackageVersionConflict(string Package, string DependsOn, string RequiredRange, string ActualVersion);
