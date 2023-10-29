# Trigger and visualize noise results

In this task you will create some simple geometry as a triangulated mesh.
Visualize it in the scene and add it as an element to the Forma proposal.

...Insert end goal picture here...

APIs: `TerrainAPI`, `ProposalAPI`, `IntegrateElementAPI` and `RenderAPI`

## Getting set up

Copy the `task-template` folder and name it `task-2`.

## Create some geometry on the terrain

Use a library like `extrude-geometry` to create a mesh based on an extruded polygon.
Use `Forma.terrain.elevationAt(x,y)` to determine the `z` elevation of each point 
in the polygon and translate the polygon to this elevation.


## Render the geometry to the scene

You can now use `Forma.render.addMesh()` to preview the geometry in the scene.
This method accepts `position`, `indices`, `normal` and `color` as flat lists, just like ThreeJS.
Only the `position` array is mandatory. With `color` you can do vertex coloring. 

Note the type of `position` is Float32Array, you can create one from a javascript array with `new Float32Array(array)`.

## Creating an element

To create an element you need to use the `Forma.integrateElements.createElementHierarchy` method.
This method takes a complex input type. I will provide an example given a list of triangle vertices in 
a `position` array here. This method requires `faces` which is equivalent to the `indices` of the `RenderAPI`.


```js
const { urn } = await Forma.integrateElements.createElementHierarchy({
    authcontext: Forma.getProjectId(),
    data: {
      rootElement: "root",
      elements: {
        root: {
          id: "root",
          properties: {
            name: "My custom element",
            category: "building",
            geometry: {
              type: "Inline",
              format: "Mesh",
              verts: position,
              faces: Array(position.length / 3).fill(1).map((_, i) => i)
            },
          },
        },
      },
    },
  });
```

With the `urn` returned from the method above you can add it the proposal 
with `Forma.proposal.addElement`. 