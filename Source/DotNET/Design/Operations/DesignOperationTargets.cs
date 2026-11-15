// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Operations;

/// <summary>
/// Says which screen, template and element an operation names. Operations are plain data, so this is read from them rather than written into them.
/// </summary>
public static class DesignOperationTargets
{
    /// <summary>
    /// Gets the screen the operation changes or asks about, when it names one.
    /// </summary>
    /// <param name="operation">The operation.</param>
    /// <returns>The screen, or null.</returns>
    public static string? TargetScreen(this DesignOperation operation) => operation switch
    {
        InsertOperation insert => insert.Screen,
        SetOperation set => set.Screen,
        RemoveOperation remove => remove.Screen,
        MoveOperation move => move.Screen,
        LinkOperation link => link.Screen,
        VariationsOperation variations => variations.Screen,
        _ => null,
    };

    /// <summary>
    /// Gets the screen template the operation changes, or builds a screen on, when it names one.
    /// </summary>
    /// <param name="operation">The operation.</param>
    /// <returns>The template, or null.</returns>
    public static string? TargetTemplate(this DesignOperation operation) => operation switch
    {
        AddScreenOperation add => add.Template,
        AddSlotOperation addSlot => addSlot.Template,
        RemoveSlotOperation removeSlot => removeSlot.Template,
        ArrangeOperation arrange => arrange.Template,
        InsertOperation insert => insert.Template,
        SetOperation set => set.Template,
        RemoveOperation remove => remove.Template,
        MoveOperation move => move.Template,
        LinkOperation link => link.Template,
        _ => null,
    };

    /// <summary>
    /// Gets the element the operation changes, when it names one.
    /// </summary>
    /// <param name="operation">The operation.</param>
    /// <returns>The element, or null.</returns>
    public static string? TargetElement(this DesignOperation operation) => operation switch
    {
        SetOperation set => set.Element,
        RemoveOperation remove => remove.Element,
        MoveOperation move => move.Element,
        LinkOperation link => link.Element,
        _ => null,
    };
}
