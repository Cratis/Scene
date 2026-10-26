// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Serialization;
using Cratis.Scene.Model.Common;
using Cratis.Scene.Model.Forms;
using Cratis.Scene.Model.Interactions;

namespace Cratis.Scene.Model.for_Form;

public class when_adding_submit_continuations : Specification
{
    readonly JsonSerializerOptions _options = new(JsonSerializerDefaults.Web) { Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) } };

    [Fact]
    void should_keep_the_original_positional_constructor()
    {
        typeof(Form).GetConstructor([typeof(string), typeof(string), typeof(PopulateSource), typeof(IReadOnlyList<FormField>), typeof(FormGenerationMode?), typeof(CommandFormLayout)]).ShouldNotBeNull();
        new Form("Create", "Create", null, []).OnSubmit.ShouldBeEmpty();
    }

    [Fact]
    void should_load_legacy_json_without_a_continuation()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "Scene.slnx"))) directory = directory.Parent;
        var corpus = JsonDocument.Parse(File.ReadAllText(Path.Combine(directory!.FullName, "command-response-fixtures.json"))).RootElement;
        var form = corpus.GetProperty("legacyForm").Deserialize<Form>(_options)!;
        form.ForCommand.ShouldEqual("Create");
        form.OnSubmit.ShouldBeEmpty();
    }

    [Fact]
    void should_serialize_polymorphic_submit_actions_and_response_bindings()
    {
        var form = new Form("Create", "Create", null, []) { OnSubmit = [new ExecuteCommandAction("FollowUp") { OnSuccess = [new NavigateAction("detail") { Arguments = [new("id", new("id", BindingSourceKind.CommandResponse))] }] }] };
        var json = JsonSerializer.SerializeToElement(form, _options);
        var action = json.GetProperty("onSubmit")[0];
        action.GetProperty("command").GetString().ShouldEqual("FollowUp");
        var argument = action.GetProperty("onSuccess")[0].GetProperty("arguments")[0];
        argument.GetProperty("value").GetProperty("kind").GetString().ShouldEqual("commandResponse");
        argument.GetProperty("value").GetProperty("path").GetString().ShouldEqual("id");
    }
}
