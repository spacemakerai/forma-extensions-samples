# Build a simple steepness analysis

In this example we will use the threejs library and its raycasting methods to build a steppness analysis. This will allow us to visualize the inclination of the terrain. 

...Insert end goal picture here...

APIs: `GeometryAPI`

## Getting set up

Copy the `task-template` folder and name it `task-4`.

## Getting the geometry

First we need to get the geometry for the terrain. We can do this by first
getting the `path` to the terrain with `Forma.geometry.getPathsByCategory({category: "terrain"})`. This will return a list of `path`'s, but we know that there is always
a single terrain in a Forma proposal.