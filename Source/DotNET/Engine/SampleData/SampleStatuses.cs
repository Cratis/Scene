// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.SampleData;

namespace Cratis.Scene.Engine.SampleData;

/// <summary>
/// The status classification of a sample data pack, and the description of the generic pack. The TypeScript twin is
/// <c language="csharp">classifySampleStatus</c>.
/// </summary>
public static class SampleStatuses
{
    /// <summary>
    /// The one line that says what the generic pack is: the pack a preview uses when none is chosen.
    /// </summary>
    public const string GenericDescription = "Made-up rows typed by each field: a name, an amount, a date and a status.";

    /// <summary>
    /// The column of the generic pack that is drawn as pills.
    /// </summary>
    public const string GenericStatusColumn = "Status";

    /// <summary>
    /// The help text a designer shows beside the sample data choice.
    /// </summary>
    public const string NeverShipsNote = "Sample data is for the preview only. Production builds never include it.";

    /// <summary>
    /// The columns of the generic pack's table.
    /// </summary>
    public static readonly IReadOnlyList<string> GenericColumns = ["Name", "Amount", "Date", "Status"];

    /// <summary>
    /// The statuses of the generic pack's <c language="csharp">Status</c> column.
    /// </summary>
    public static readonly SampleStatusClassification GenericStatuses = new(["Active"], ["Pending"], ["Inactive"]);

    /// <summary>
    /// Classifies a status value for its pill. Values are compared without regard to letter case or surrounding space, the same way in every locale,
    /// so a pack lists the words of its own language. A value the pack does not name is neutral.
    /// </summary>
    /// <param name="classification">The pack's classification, if it has one.</param>
    /// <param name="value">The value of the status column.</param>
    /// <returns>How the pill is coloured.</returns>
    public static SampleStatus Classify(SampleStatusClassification? classification, string? value)
    {
        if (classification is null || value is null)
        {
            return SampleStatus.Neutral;
        }

        var key = value.Trim();
        bool Has(IReadOnlyList<string>? list) => list?.Any(item => string.Equals(item.Trim(), key, StringComparison.OrdinalIgnoreCase)) == true;
        return Has(classification.Good) ? SampleStatus.Good
            : Has(classification.Pending) ? SampleStatus.Pending
                : Has(classification.Bad) ? SampleStatus.Bad
                    : SampleStatus.Neutral;
    }
}
