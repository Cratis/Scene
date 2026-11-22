// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Elements;
using Cratis.Scene.Model.Guards;
using Cratis.Screenplay;

namespace Cratis.Scene.Screenplay.Forward.for_ScreenDirectiveConverter.when_converting;

public class and_an_action_has_presentation : Specification
{
    static ExternalComponent Convert(string? placement = null)
    {
        var presentation = placement is null ? "" : $"          presentation placement \"{placement}\"\n          presentation tone \"danger\"";
        var source = """
            module Shop
              feature Billing
                slice StateView Browse
                  screen Invoices
                    action ArchiveInvoice for item
                      label "Archive"
                      with invoiceId from item.invoiceId
                      navigate to List by invoiceId
            """ + "\n" + presentation;
        var parsed = new ScreenplayCompiler().Parse(source);
        Assert.True(parsed.Success, string.Join(Environment.NewLine, parsed.Diagnostics));
        var screen = parsed.Value!.Modules.Single().Features.Single().Slices.Single().Screens.Single();
        return (ExternalComponent)ScreenDirectiveConverter.Convert(screen.Directives, "screen").Single();
    }

    [Theory]
    [InlineData("Menu")]
    [InlineData("menu")]
    [InlineData("ContextMenu")]
    public void should_preserve_the_authored_placement(string placement) =>
        ((IDictionary<string, string>)Convert(placement).Properties["presentation"]!)["placement"].ShouldEqual(placement);

    [Fact]
    public void should_keep_the_command_label_subject_and_inputs()
    {
        var properties = Convert("Menu").Properties;
        properties["command"].ShouldEqual("ArchiveInvoice");
        properties["label"].ShouldEqual("Archive");
        properties["actionSubject"].ShouldEqual("item");
        ((IDictionary<string, SubjectReference>)properties["subjectInputs"]!)["invoiceId"].Subject.ShouldEqual("item.invoiceId");
    }

    [Fact]
    public void should_preserve_advisory_values() =>
        ((IDictionary<string, string>)Convert("Menu").Properties["presentation"]!)["tone"].ShouldEqual("danger");

    [Fact]
    public void should_preserve_navigation()
    {
        var properties = Convert("Menu").Properties;
        properties["navigateToScreen"].ShouldEqual("List");
        properties["navigateByParameter"].ShouldEqual("invoiceId");
    }

    [Fact]
    public void should_not_add_a_presentation_key_when_none_was_authored() =>
        Convert().Properties.ContainsKey("presentation").ShouldBeFalse();
}
