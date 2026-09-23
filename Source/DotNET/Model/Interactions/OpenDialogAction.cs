// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Interactions;

/// <summary>
/// Opens a dialog over the application.
/// </summary>
/// <param name="DialogTemplate">The dialog template to open.</param>
public record OpenDialogAction(string DialogTemplate) : InteractionAction;
