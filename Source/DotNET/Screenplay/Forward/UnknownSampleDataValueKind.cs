// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Screenplay.Syntax;

namespace Cratis.Scene.Screenplay.Forward;

/// <summary>
/// The exception that is thrown when a Screenplay sample data field has a <see cref="SampleDataValueKind"/> that
/// <see cref="SampleDataConverter"/> does not yet know how to convert.
/// </summary>
/// <param name="kind">The unrecognized <see cref="SampleDataValueKind"/>.</param>
public class UnknownSampleDataValueKind(SampleDataValueKind kind) : Exception($"'{kind}' is not a known sample-data value kind");
