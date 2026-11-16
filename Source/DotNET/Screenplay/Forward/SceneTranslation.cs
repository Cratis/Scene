// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Screenplay;
using Cratis.Screenplay.Diagnostics;
using Cratis.Screenplay.Syntax;
using SceneModel = Cratis.Scene.Screenplay.Forward;

namespace Cratis.Scene.Screenplay.Forward;

/// <summary>
/// The one place a compiled Screenplay becomes a Scene application. Every conversion the converters refuse by throwing is
/// reported as a named error rather than thrown, so a caller gets a failed compilation result instead of an exception.
/// </summary>
public static class SceneTranslation
{
    /// <summary>
    /// The diagnostic code of a Screenplay the converters refuse to translate.
    /// </summary>
    public const string RefusedTranslation = "SCENE-SCREENPLAY-0001";

    static readonly Type[] _conversionFailures =
    [
        typeof(SceneModel.UnsupportedUiSyntax),
        typeof(SceneModel.UnsupportedScreenContent),
        typeof(SceneModel.UnsupportedGuardedScreenAction),
        typeof(SceneModel.UnsupportedGuardedInteraction),
        typeof(SceneModel.UnknownScreenDirective),
        typeof(SceneModel.UnknownArrangement),
        typeof(SceneModel.UnknownArrangementContainerKind),
        typeof(SceneModel.UnknownArrangementNode),
        typeof(SceneModel.UnknownFormPopulateSource),
        typeof(SceneModel.UnknownInteractionAction),
        typeof(SceneModel.UnknownInteractionTrigger),
        typeof(SceneModel.UnknownIntervalUnit),
        typeof(SceneModel.UnknownNotificationLevel),
        typeof(SceneModel.UnknownSizeClassName)
    ];

    public static CompilationResult<SceneModel.SceneApplication> Translate(CompilationResult<ApplicationSyntax> compilation)
    {
        if (compilation is not { Success: true, Value: { } application })
        {
            return CompilationResult<SceneModel.SceneApplication>.Failed(compilation.Diagnostics);
        }

        List<Diagnostic> refusals = [];
        SceneModel.SceneApplication? scene = null;
        try
        {
            scene = new SceneModel.ScreenplaySceneVisitor().Visit(application);
        }
        catch (Exception exception) when (IsConversionFailure(exception))
        {
            refusals.Add(Refused(exception, application));
        }

        return refusals.Count == 0 && scene is not null
            ? new(scene, compilation.Diagnostics)
            : CompilationResult<SceneModel.SceneApplication>.Failed([.. compilation.Diagnostics, .. refusals]);
    }

    public static bool IsConversionFailure(Exception exception) => _conversionFailures.Contains(exception.GetType());

    /// <summary>
    /// A conversion Stage refuses while creating the profile from an already translated scene, reported the same way.
    /// </summary>
    public static Diagnostic Refused(Exception exception, ApplicationSyntax? application)
    {
        var location = LocationOf(exception, application);
        var where = location is null ? string.Empty : $" (at {Describe(location)})";
        return Diagnostic.Error(
            RefusedTranslation,
            $"Scene cannot translate this Screenplay, so nothing is rendered: {exception.Message}{where}",
            location ?? SourceLocation.Start);
    }

    public static string Describe(SourceLocation location) =>
        $"line {location.Line}, column {location.Column}{(location.Path is { Length: > 0 } path ? $" of {path}" : string.Empty)}";

    static SourceLocation? LocationOf(Exception exception, ApplicationSyntax? application) => exception switch
    {
        SceneModel.UnsupportedUiSyntax ui => ui.Location,
        SceneModel.UnsupportedGuardedScreenAction action => action.Location,
        _ when application is not null && QuotedName(exception.Message) is { } name => NodeLocator.Find(application, name),
        _ => null
    };

    /// <summary>
    /// Stage names what it could not translate between the first pair of single quotes: a syntax type or a screen name.
    /// </summary>
    static string? QuotedName(string message)
    {
        var start = message.IndexOf('\'', StringComparison.Ordinal);
        var end = start < 0 ? -1 : message.IndexOf('\'', start + 1);
        return end > start + 1 ? message[(start + 1)..end] : null;
    }

    sealed class NodeLocator(string name) : ScreenplaySyntaxWalker
    {
        public SourceLocation? Location { get; private set; }

        public static SourceLocation? Find(ApplicationSyntax application, string name)
        {
            var locator = new NodeLocator(name);
            locator.VisitApplication(application);
            return locator.Location;
        }

        public override void VisitNode(SyntaxNode node)
        {
            if (Location is null && (node.GetType().Name == name || (node is ScreenSyntax screen && screen.Name == name)))
            {
                Location = node.Location;
            }

            base.VisitNode(node);
        }
    }
}
