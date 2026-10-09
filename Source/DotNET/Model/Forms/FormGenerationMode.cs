// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Forms;

/// <summary>
/// How a command form's fields are generated.
/// </summary>
public enum FormGenerationMode
{
    /// <summary>
    /// Generate fields from command metadata.
    /// </summary>
    Auto = 0,

    /// <summary>
    /// Use authored fields.
    /// </summary>
    Manual = 1,
}
