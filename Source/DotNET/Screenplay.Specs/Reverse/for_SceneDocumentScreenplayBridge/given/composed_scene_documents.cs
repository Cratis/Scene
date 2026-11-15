// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Screenplay.Reverse.for_SceneDocumentScreenplayBridge.given;

// Two roles' screens composed from the UI declarations Screenplay 4.120 can say: a shell layout beside the Studio screen
// layout, a screen template and a dialog template with content of their own, what they expose, the values each instance
// contributes, and screens that contribute to a contribution point. Since Scene 5 a contribution point is an outlet the layout
// declares rather than a slot that names it - one of navigation is the application's navigation too - and a routed slot stands where the layout's outlet was. Both roles' documents declare the
// same layouts, templates and exposures - Screenplay declares them once for the application.
public class composed_scene_documents : a_scene_document_transport
{
    const string Declarations = """
          "layouts":[
            {"name":"StudioScreen","slots":[{"name":"actions"},{"name":"content"}],
             "outlets":[{"name":"WorkspaceActions","kind":"actions","slot":"actions","defaults":[]},{"name":"Navigation","kind":"navigation","defaults":[]}]},
            {"name":"OperatorShell","slots":[{"name":"header"},{"name":"navigation"},{"name":"content"},{"name":"banner","routed":true}],
             "metadata":{"type":"shell","category":"Application","scopes":["Application","Module"]}}
          ],
          "screenTemplates":[
            {"name":"MasterDetail","fitsSlot":"content","displayName":"Master detail","description":"A list with the selected item beside it",
             "slots":[{"name":"list"},{"name":"detail"}],
             "metadata":{"category":"Lists"},
             "content":{"list":[{"id":"md-header","name":"Header","componentName":"core:header","properties":{"title":"Items","actions":[]},"slots":{}}]}}
          ],
          "dialogTemplates":[
            {"name":"EditDialog","slots":[{"name":"body"},{"name":"actions"}],
             "content":{"actions":[{"id":"dialog-cancel","name":"Cancel","componentName":"core:button","properties":{"label":"Cancel"},"slots":{}}]}}
          ],
          "navigation":{"application":{"outlets":[{"name":"Navigation","kind":"navigation","defaults":[]}]},"modules":[]},
          "exposures":[
            {"owner":"MasterDetail","properties":[
              {"component":"md-header","path":"title","label":"Title"},
              {"component":"md-header","path":"actions","label":"Actions","operations":["add","remove","reorder"],"editableFields":["label","icon"]}
            ]},
            {"owner":"EditDialog","properties":[{"component":"dialog-cancel","path":"label","label":"Cancel label"}]}
          ],
        """;

    protected const string Operator = "{" + Declarations + """
          "screens":[
            {"name":"Screen","layout":"StudioScreen","screenTemplate":"MasterDetail",
             "slotContent":{"detail":[{"id":"orders-detail","name":"Order","componentName":"core:card","properties":{"title":"Order"},"slots":{}}]},
             "forms":[],
             "contributions":[{"contributionPointName":"Navigation","order":1,"content":{"id":"to-orders","name":"Orders","componentName":"core:link","properties":{"label":"Orders"},"slots":{}}}]},
            {"name":"Details","layout":"StudioScreen",
             "slotContent":{"content":[{"id":"details-title","name":"Details","componentName":"core:title","properties":{"text":"Details"},"slots":{}}]},
             "forms":[],
             "contributions":[
               {"contributionPointName":"Navigation","order":2,"content":{"id":"to-details","name":"Details","componentName":"core:link","properties":{"label":"Details"},"slots":{}}},
               {"contributionPointName":"WorkspaceActions","content":{"id":"refresh","name":"Refresh","componentName":"core:button","properties":{"label":"Refresh"},"slots":{}}}
             ]}
          ],
          "instanceContributions":[
            {"instance":"screen:Screen","component":"md-header","path":"title","value":"Orders"},
            {"instance":"screen:Screen","component":"md-header","path":"actions","items":[
              {"id":"export:csv","values":{"label":"Export","icon":"pi pi-download"}},
              {"id":"archive","values":{"label":"Archive"}}
            ]}
          ]
        }
        """;

    protected const string Auditor = "{" + Declarations + """
          "screens":[
            {"name":"Screen","layout":"StudioScreen","screenTemplate":"MasterDetail",
             "slotContent":{"detail":[{"id":"audit-detail","name":"Audit","componentName":"core:card","properties":{"title":"Audit"},"slots":{}}]},
             "forms":[],
             "contributions":[{"contributionPointName":"Navigation","order":3,"content":{"id":"to-audit","name":"Audit","componentName":"core:link","properties":{"label":"Audit"},"slots":{}}}]}
          ],
          "instanceContributions":[
            {"instance":"screen:Screen","component":"md-header","path":"title","value":"Audit trail"}
          ]
        }
        """;
}
