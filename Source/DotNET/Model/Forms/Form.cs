// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Forms;

/// <summary>
/// The command-side counterpart to a table or summary: a named, typed form for one command.
/// </summary>
/// <param name="Name">The form's name.</param>
/// <param name="ForCommand">The resolved name of the command the form builds.</param>
/// <param name="PopulateSource">Where the form's initial values come from, if any.</param>
/// <param name="Fields">The form's fields.</param>
public record Form(string Name, string ForCommand, PopulateSource? PopulateSource, IReadOnlyList<FormField> Fields);
