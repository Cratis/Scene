// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Screenplay.Diagnostics;

namespace Cratis.Scene.Screenplay.Reverse;

/// <summary>
/// Holds the codes identifying the <see cref="Diagnostic">diagnostics</see> Studio itself raises while reading
/// a Screenplay document, as opposed to the ones the compiler raises while parsing it.
/// </summary>
/// <remarks>
/// A <see cref="Diagnostic"/> carries a code alongside its message so a consumer has something stable to group
/// and suppress on. The compiler owns the <c language="csharp">PLAY</c> range and Cratis Arc owns <c language="csharp">SP</c>, so these carry a
/// prefix of their own — a reader seeing all three in one list can tell which tool said what.
/// <para>
/// The import preview surfaces these codes, so each one is a contract: a number is never reused and never
/// renumbered, and a new code is appended to the end of the sequence whatever it is about.
/// </para>
/// <para>
/// There is deliberately one code per place a diagnostic is raised rather than one per construct that can be
/// dropped. The message says which construct it was; splitting further is a decision for whoever gives these
/// codes a consumer.
/// </para>
/// </remarks>
public static class ScreenplayImportDiagnosticCodes
{
    /// <summary>
    /// A folder submitted for import holds no <c language="csharp">.play</c> files.
    /// </summary>
    public const string FolderHoldsNoPlayFiles = "STUDIO0001";

    /// <summary>
    /// A file in a submitted folder could not be read as Screenplay.
    /// </summary>
    public const string PlayFileCouldNotBeRead = "STUDIO0002";

    /// <summary>
    /// The document declares something at the application level that the canvas has no way to record.
    /// </summary>
    public const string ApplicationDeclarationNotCarried = "STUDIO0003";

    /// <summary>
    /// A slice builds a read model the canvas cannot carry, because it only holds one on a State View slice.
    /// </summary>
    public const string ReadModelNotCarried = "STUDIO0004";

    /// <summary>
    /// A construct declared on a slice was not added to the canvas.
    /// </summary>
    public const string SliceConstructNotCarried = "STUDIO0005";

    /// <summary>
    /// Something declared on a command was not added to the canvas.
    /// </summary>
    public const string CommandConstructNotCarried = "STUDIO0006";

    /// <summary>
    /// A slice's projection names no event, so its read model is carried with nothing projected into it.
    /// </summary>
    public const string ProjectionNamesNoEvent = "STUDIO0007";

    /// <summary>
    /// A validation rule declared on a command was not added to the canvas.
    /// </summary>
    public const string ValidationRuleNotCarried = "STUDIO0008";

    /// <summary>
    /// Something declared on a query was not added to the canvas.
    /// </summary>
    public const string QueryConstructNotCarried = "STUDIO0009";

    /// <summary>
    /// The code reported when the code a command or policy states lives in a file the document points at.
    /// </summary>
    public const string CodeFileNotRead = "STUDIO0010";

    /// <summary>
    /// The code reported when a policy requirement cannot be held as the groups of conditions the board has.
    /// </summary>
    public const string PolicyRequirementNotCarried = "STUDIO0011";

    /// <summary>
    /// The code reported when the Screenplay binder binds, or fails to bind, a model at an ESM version Studio does not admit for the executable model.
    /// </summary>
    // Not an import code: it is raised where Studio uses the Screenplay executable model (Admission/StudioEsmAdmission.cs),
    // and lives here because this is where every STUDIO code is allocated.
    public const string EsmVersionNotAdmitted = "STUDIO0012";

    /// <summary>
    /// A specification on a slice without a command exercises a command; its when part is not added to the canvas.
    /// </summary>
    public const string SpecificationCommandNotCarried = "STUDIO0013";

    /// <summary>
    /// An event reference in the document cannot be resolved, so the document cannot be imported.
    /// </summary>
    public const string EventReferenceNotResolved = "STUDIO0014";

    public const string ZipInvalid = "STUDIO0015";
    public const string ZipPathInvalid = "STUDIO0016";
    public const string ZipDuplicateEntry = "STUDIO0017";
    public const string ZipPathCollision = "STUDIO0018";
    public const string ZipLinkNotAllowed = "STUDIO0019";
    public const string ZipFileNotSupported = "STUDIO0020";
    public const string ZipDocumentLimit = "STUDIO0021";
    public const string ZipExpandedByteLimit = "STUDIO0022";
    public const string ZipCompressionRatioLimit = "STUDIO0023";
    public const string ZipArchiveByteLimit = "STUDIO0024";
    public const string ZipEncodingInvalid = "STUDIO0025";

    /// <summary>
    /// A screen construct, a form or a UI declaration the import cannot turn into a screen document.
    /// </summary>
    public const string ScreenConstructNotCarried = "STUDIO0026";

    /// <summary>
    /// An event source, a stream's stream id or a command's route the document states that the board cannot hold - a
    /// stream id composed from parts, or read through a path.
    /// </summary>
    public const string EventRouteNotCarried = "STUDIO0027";

    /// <summary>
    /// An identity detail, or part of the identity block, the board cannot hold - a code or file source, a type it has no
    /// equivalent for, a key it cannot edit, or the block's description.
    /// </summary>
    public const string IdentityDetailNotCarried = "STUDIO0028";

    /// <summary>
    /// The import added an event source that, once the domain's read model caught up, shares its name with another
    /// event source on the same domain - most likely a concurrent import or an AddEventSource that was not visible
    /// yet when this one chose to add rather than match (Cratis/StudioIssues#583). Nothing was lost or overwritten;
    /// this is purely informational, never a loss code.
    /// </summary>
    public const string EventSourceNameMayBeDuplicated = "STUDIO0029";

    /// <summary>
    /// A Screenplay example that names a given context was imported as inline givens rather than as use of that context,
    /// because the context was missing, differed, or the reference could not be restored without reordering or duplicating
    /// givens.
    /// </summary>
    public const string GivenContextNotRestored = "STUDIO0030";

    /// <summary>
    /// A differing event pin is not retained when a consumer slice imports its declaration as external.
    /// Owned declarations retain pins and do not raise this code.
    /// </summary>
    public const string EventStoredNameNotCarried = "STUDIO0031";

    /// <summary>
    /// A .strings catalog that came with the document: its texts are not read, so the screens keep the $strings references they state
    /// and the catalog's translations are not on the canvas.
    /// </summary>
    public const string StringsCatalogNotCarried = "STUDIO0041";

    /// <summary>
    /// The import plan adjusts what the document states to fit the board.
    /// </summary>
    public const string ImportPlanAdjusted = "STUDIO0042";

    /// <summary>
    /// A state machine or workflow the domain already has is left as it is, and what a guard, a condition or a simulation says that the board cannot hold is not carried.
    /// </summary>
    public const string LifecycleNotCarried = "STUDIO0043";

    /// <summary>
    /// A document written for an older Screenplay was migrated before it was imported; the message names the version and the steps.
    /// </summary>
    public const string MigratedFromOlderScreenplay = "STUDIO0044";

    /// <summary>
    /// What the migration of an older document could not decide on its own and left for the author to check.
    /// </summary>
    public const string MigrationNeedsReview = "STUDIO0045";

    /// <summary>
    /// The codes saying the canvas will hold less than the document states. The document is still legal and
    /// still imports; every other code is about whether it can be compiled at all.
    /// </summary>
    static readonly HashSet<string> _losses =
    [
        ApplicationDeclarationNotCarried,
        ReadModelNotCarried,
        SliceConstructNotCarried,
        CommandConstructNotCarried,
        ProjectionNamesNoEvent,
        ValidationRuleNotCarried,
        QueryConstructNotCarried,
        CodeFileNotRead,
        PolicyRequirementNotCarried,
        SpecificationCommandNotCarried,
        EventRouteNotCarried,
        IdentityDetailNotCarried,
        GivenContextNotRestored,
        EventStoredNameNotCarried,
        StringsCatalogNotCarried,
        ImportPlanAdjusted,
        LifecycleNotCarried
    ];

    public static bool IsLoss(string? code) => code is not null && _losses.Contains(code);
}
