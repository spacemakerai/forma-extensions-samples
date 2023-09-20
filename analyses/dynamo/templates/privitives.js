console.log(
  JSON.stringify(
    (script = {
      Uuid: "8429ca54-d142-4b1f-95b0-9d5c0f7fc015",
      IsCustomNode: false,
      Description: "",
      Name: "Primitives",
      ElementResolver: {
        ResolutionMap: {},
      },
      Inputs: [
        {
          Id: "4c82de1af5d34b8dad85913e9de894db",
          Name: "Input String",
          Type: "string",
          Type2: "string",
          Value: "testT",
          Description: "Creates a string",
          SelectedIndex: 0,
        },
        {
          Id: "a7ba1ca8bc5b425699dee0087437dce4",
          Name: "Upper",
          Type: "boolean",
          Type2: "boolean",
          Value: "true",
          Description: "Enables selection between True and False",
          SelectedIndex: 0,
        },
      ],
      Outputs: [
        {
          Id: "56f0d7f36bbc4e8fb55d56953ea8f834",
          Name: "Changed Case",
          Type: "string",
          InitialValue: "TESTT",
          Description:
            "Converts the given string to all uppercase characters or all lowercase characters based on a boolean parameter.\n\nString.ChangeCase (string: string, upper: bool): string",
        },
      ],
      Nodes: [
        {
          ConcreteType: "CoreNodeModels.Input.StringInput, CoreNodeModels",
          NodeType: "StringInputNode",
          InputValue: "testT",
          Id: "4c82de1af5d34b8dad85913e9de894db",
          Inputs: [],
          Outputs: [
            {
              Id: "74b49efaa9c146d29ce8dd6e5ce6d2e1",
              Name: "",
              Description: "String",
              UsingDefaultValue: false,
              Level: 2,
              UseLevels: false,
              KeepListStructure: false,
            },
          ],
          Replication: "Disabled",
          Description: "Creates a string",
        },
        {
          ConcreteType: "Dynamo.Graph.Nodes.ZeroTouch.DSFunction, DynamoCore",
          NodeType: "FunctionNode",
          FunctionSignature: "DSCore.String.ChangeCase@string,bool",
          Id: "56f0d7f36bbc4e8fb55d56953ea8f834",
          Inputs: [
            {
              Id: "8511cc3674f14da090c6c6d1ca1875f1",
              Name: "string",
              Description:
                "String to be made uppercase or lowercase.\n\nstring",
              UsingDefaultValue: false,
              Level: 2,
              UseLevels: false,
              KeepListStructure: false,
            },
            {
              Id: "bd243a5481f345b0bd939c40e6e11e3b",
              Name: "upper",
              Description:
                "True to convert to uppercase, false to convert to lowercase.\n\nbool",
              UsingDefaultValue: false,
              Level: 2,
              UseLevels: false,
              KeepListStructure: false,
            },
          ],
          Outputs: [
            {
              Id: "3cbb1ed6cfce47ff8b1a226ff1d63cf5",
              Name: "string",
              Description: "String with converted case.",
              UsingDefaultValue: false,
              Level: 2,
              UseLevels: false,
              KeepListStructure: false,
            },
          ],
          Replication: "Auto",
          Description:
            "Converts the given string to all uppercase characters or all lowercase characters based on a boolean parameter.\n\nString.ChangeCase (string: string, upper: bool): string",
        },
        {
          ConcreteType: "CoreNodeModels.Input.BoolSelector, CoreNodeModels",
          NodeType: "BooleanInputNode",
          InputValue: true,
          Id: "a7ba1ca8bc5b425699dee0087437dce4",
          Inputs: [],
          Outputs: [
            {
              Id: "e0bf84a5556c43628ca2d806a98b4277",
              Name: "",
              Description: "Boolean",
              UsingDefaultValue: false,
              Level: 2,
              UseLevels: false,
              KeepListStructure: false,
            },
          ],
          Replication: "Disabled",
          Description: "Enables selection between True and False",
        },
      ],
      Connectors: [
        {
          Start: "74b49efaa9c146d29ce8dd6e5ce6d2e1",
          End: "8511cc3674f14da090c6c6d1ca1875f1",
          Id: "5c10ae3fcc554059af05050d816eed81",
          IsHidden: "False",
        },
        {
          Start: "e0bf84a5556c43628ca2d806a98b4277",
          End: "bd243a5481f345b0bd939c40e6e11e3b",
          Id: "f1c8ba65e5e74f7d844a6142f9af7b43",
          IsHidden: "False",
        },
      ],
      Dependencies: [],
      NodeLibraryDependencies: [],
      Thumbnail: "",
      GraphDocumentationURL: null,
      ExtensionWorkspaceData: [
        {
          ExtensionGuid: "28992e1d-abb9-417f-8b1b-05e053bee670",
          Name: "Properties",
          Version: "2.17",
          Data: {},
        },
        {
          ExtensionGuid: "DFBD9CC0-DB40-457A-939E-8C8555555A9D",
          Name: "Generative Design",
          Version: "4.0",
          Data: {},
        },
      ],
      Author: "",
      Linting: {
        activeLinter: "None",
        activeLinterId: "7b75fb44-43fd-4631-a878-29f4d5d8399a",
        warningCount: 0,
        errorCount: 0,
      },
      Bindings: [],
      View: {
        Dynamo: {
          ScaleFactor: 1.0,
          HasRunWithoutCrash: true,
          IsVisibleInDynamoLibrary: true,
          Version: "2.17.0.3472",
          RunType: "Automatic",
          RunPeriod: "1000",
        },
        Camera: {
          Name: "_Background Preview",
          EyeX: -17.0,
          EyeY: 24.0,
          EyeZ: 50.0,
          LookX: 12.0,
          LookY: -13.0,
          LookZ: -58.0,
          UpX: 0.0,
          UpY: 1.0,
          UpZ: 0.0,
        },
        ConnectorPins: [],
        NodeViews: [
          {
            Name: "Input String",
            ShowGeometry: true,
            Id: "4c82de1af5d34b8dad85913e9de894db",
            IsSetAsInput: true,
            IsSetAsOutput: false,
            Excluded: false,
            X: 211.0,
            Y: 310.0,
          },
          {
            Name: "Changed Case",
            ShowGeometry: true,
            Id: "56f0d7f36bbc4e8fb55d56953ea8f834",
            IsSetAsInput: false,
            IsSetAsOutput: true,
            Excluded: false,
            X: 659.0,
            Y: 314.0,
          },
          {
            Name: "Upper",
            ShowGeometry: true,
            Id: "a7ba1ca8bc5b425699dee0087437dce4",
            IsSetAsInput: true,
            IsSetAsOutput: false,
            Excluded: false,
            X: 202.0,
            Y: 466.0,
          },
        ],
        Annotations: [],
        X: 0.0,
        Y: 0.0,
        Zoom: 1.0,
      },
    })
  )
);