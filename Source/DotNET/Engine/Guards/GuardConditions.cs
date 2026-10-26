// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using Cratis.Scene.Model.Guards;

namespace Cratis.Scene.Engine.Guards;

/// <summary>
/// Evaluates the closed guard vocabulary without executing authored code.
/// </summary>
public static class GuardConditions
{
    static readonly JsonSerializerOptions _options = new(JsonSerializerDefaults.Web);
    static readonly HashSet<string> _forbidden = ["__proto__", "prototype", "constructor"];

    /// <summary>
    /// Evaluates a typed guard. Null means the shape is unsupported.
    /// </summary>
    /// <param name="condition">The guard.</param>
    /// <param name="item">The selected subject.</param>
    /// <returns>Whether it holds, or null when unsupported.</returns>
    public static bool? Evaluate(GuardCondition condition, object? item) => Evaluate(JsonSerializer.SerializeToElement(condition, _options), JsonSerializer.SerializeToElement(item, _options));

    /// <summary>
    /// Determines whether every node uses the supported guard vocabulary.
    /// </summary>
    /// <param name="condition">The wire predicate.</param>
    /// <returns>Whether it is understood.</returns>
    public static bool CanEvaluate(JsonElement condition)
    {
        var kind = Text(Get(condition, "kind"));
        var operation = Text(Get(condition, "operator"));
        var left = Get(condition, "left");
        var right = Get(condition, "right");
        if (kind == "logical") return (operation == "And" || operation == "Or") && CanEvaluate(left) && CanEvaluate(right);
        if (kind != "comparison") return false;
        return ValidComparison(condition, operation);
    }

    /// <summary>
    /// Evaluates a wire predicate against a wire subject.
    /// </summary>
    /// <param name="condition">The wire predicate.</param>
    /// <param name="item">The selected subject.</param>
    /// <returns>Whether it holds, or null when unsupported.</returns>
    public static bool? Evaluate(JsonElement condition, JsonElement item)
    {
        if (!CanEvaluate(condition)) return null;
        var operation = Text(Get(condition, "operator"));
        if (Text(Get(condition, "kind")) == "comparison") return Compare(condition, item, operation);
        var left = Evaluate(Get(condition, "left"), item) == true;
        var right = Evaluate(Get(condition, "right"), item) == true;
        return operation == "And" ? left && right : left || right;
    }

    static bool ValidComparison(JsonElement condition, string operation)
    {
        if (!ValidPath(Text(Get(Get(condition, "left"), "subject")))) return false;
        if (!Enum.TryParse<GuardOperator>(operation, out var parsed)) return false;
        if (!Enum.IsDefined(parsed) || operation != parsed.ToString()) return false;
        return ValidEnumeration(Get(condition, "enumeration")) && ValidLiteral(parsed, Get(condition, "right"));
    }

    static bool ValidEnumeration(JsonElement value)
    {
        if (value.ValueKind == JsonValueKind.Undefined) return true;
        if (value.ValueKind != JsonValueKind.Array || value.GetArrayLength() == 0) return false;
        if (value.EnumerateArray().Any(member => member.ValueKind != JsonValueKind.String)) return false;
        return value.EnumerateArray().Select(member => member.GetString()).Distinct().Count() == value.GetArrayLength();
    }

    static bool ValidLiteral(GuardOperator operation, JsonElement right)
    {
        if (!Scalar(right)) return false;
        if (operation is GuardOperator.GreaterThan or GuardOperator.GreaterThanOrEqual or GuardOperator.LessThan or GuardOperator.LessThanOrEqual) return right.ValueKind == JsonValueKind.Number;
        return operation != GuardOperator.StartsWith || right.ValueKind == JsonValueKind.String;
    }

    static bool ValidPath(string path) => path.StartsWith("item.", StringComparison.Ordinal) && path[5..].Split('.').All(part => part.Length > 0 && (char.IsAsciiLetter(part[0]) || part[0] == '_') && part.All(character => char.IsAsciiLetterOrDigit(character) || character == '_') && !_forbidden.Contains(part));

    static JsonElement Resolve(JsonElement reference, JsonElement item)
    {
        var path = Text(Get(reference, "subject"));
        if (!ValidPath(path)) return default;
        foreach (var part in path[5..].Split('.')) item = Get(item, part);
        return item;
    }

    static bool Compare(JsonElement condition, JsonElement item, string operation)
    {
        var enumeration = Get(condition, "enumeration");
        var left = Normalize(Resolve(Get(condition, "left"), item), enumeration);
        var right = Normalize(Get(condition, "right"), enumeration);
        if (left.ValueKind == JsonValueKind.Undefined || right.ValueKind == JsonValueKind.Undefined) return false;
        if (left.ValueKind == JsonValueKind.Null || right.ValueKind == JsonValueKind.Null) return operation == "Equal" && left.ValueKind == JsonValueKind.Null && right.ValueKind == JsonValueKind.Null;
        return CompareValues(left, right, operation);
    }

    static bool CompareValues(JsonElement left, JsonElement right, string operation) => operation switch
        {
            "Equal" => Same(left, right),
            "NotEqual" => Scalar(left) && Compatible(left, right) && !Same(left, right),
            "Contains" => Contains(left, right),
            "StartsWith" => left.ValueKind == JsonValueKind.String && right.ValueKind == JsonValueKind.String && left.GetString()!.StartsWith(right.GetString()!, StringComparison.Ordinal),
            _ => Numeric(left, right, operation)
        };

    static JsonElement Normalize(JsonElement value, JsonElement enumeration)
    {
        if (enumeration.ValueKind != JsonValueKind.Array || value.ValueKind == JsonValueKind.Null) return value;
        if (Ordinal(value, enumeration.GetArrayLength(), out var ordinal)) return enumeration[ordinal];
        if (value.ValueKind == JsonValueKind.String) return enumeration.EnumerateArray().FirstOrDefault(member => string.Equals(member.GetString(), value.GetString(), StringComparison.OrdinalIgnoreCase));
        return default;
    }

    static bool Ordinal(JsonElement value, int length, out int ordinal)
    {
        ordinal = 0;
        if (value.ValueKind != JsonValueKind.Number) return false;
        var number = value.GetDouble();
        if (number != Math.Truncate(number)) return false;
        if (number < 0 || number >= length) return false;
        ordinal = (int)number;
        return true;
    }

    static bool Numeric(JsonElement left, JsonElement right, string operation)
    {
        if (left.ValueKind != JsonValueKind.Number || right.ValueKind != JsonValueKind.Number) return false;
        var first = left.GetDouble();
        var second = right.GetDouble();
        return CompareNumbers(first, second, operation);
    }

    static bool CompareNumbers(double first, double second, string operation) => operation switch
        {
            "GreaterThan" => first > second,
            "GreaterThanOrEqual" => first >= second,
            "LessThan" => first < second,
            "LessThanOrEqual" => first <= second,
            _ => false
        };

    static bool Contains(JsonElement left, JsonElement right) => left.ValueKind switch
    {
        JsonValueKind.String => right.ValueKind == JsonValueKind.String && left.GetString()!.Contains(right.GetString()!, StringComparison.Ordinal),
        JsonValueKind.Array => left.EnumerateArray().Any(value => Same(value, right)),
        _ => false
    };

    static bool Same(JsonElement left, JsonElement right) => Compatible(left, right) && left.ValueKind switch
    {
        JsonValueKind.String => left.GetString() == right.GetString(),
        JsonValueKind.Number => left.GetDouble() == right.GetDouble(),
        JsonValueKind.True or JsonValueKind.False => left.GetBoolean() == right.GetBoolean(),
        _ => false
    };

    static bool Compatible(JsonElement left, JsonElement right) => left.ValueKind == right.ValueKind || (left.ValueKind is JsonValueKind.True or JsonValueKind.False && right.ValueKind is JsonValueKind.True or JsonValueKind.False);
    static bool Scalar(JsonElement value) => value.ValueKind is JsonValueKind.String or JsonValueKind.Number or JsonValueKind.True or JsonValueKind.False or JsonValueKind.Null;
    static string Text(JsonElement value) => value.ValueKind == JsonValueKind.String ? value.GetString()! : string.Empty;
    static JsonElement Get(JsonElement value, string property) => value.ValueKind == JsonValueKind.Object && value.TryGetProperty(property, out var found) ? found : default;
}
