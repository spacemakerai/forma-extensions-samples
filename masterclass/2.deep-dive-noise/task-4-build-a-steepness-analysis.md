# Build a steepness analysis

In this example we will use the threejs library and its raycasting methods to build a steppness analysis. This will allow us to visualize the inclination of the terrain. 

...Insert end goal picture here...

APIs: `GeometryAPI`, `GroundTextureAPI`

## Getting set up

Copy the `task-template` folder and name it `task-4`.

## Getting the geometry

First we need to get the geometry for the terrain. We can do this by first
getting the `path` to the terrain with `Forma.geometry.getPathsByCategory({category: "terrain"})`. This will return a list of `path`'s, but we know that there is always
a single terrain in a Forma proposal.

Now with this `path` we can call `Forma.geometry.getTriangles({path})`. This gives
us all the triangles for the terrain.

## Setting up threejs

To create a three js scene you can create a `THREE.BufferGeometry` and `THREE.Mesh` with the triangles returned from the `getTriangles` method like this:

```js
const geometry = new THREE.BufferGeometry()
geometry.setAttribute("position", new THREE.BufferAttribute(triangles, 3))

const material = new THREE.MeshBasicMaterial()
const mesh = new THREE.Mesh(geometry, material)

const scene = new THREE.Scene();
scene.add(mesh)
```

In this example we're going to raycast on the terrain. This operation will be much
faster if we use the `three-mesh-bvh`. This can be setup like this:

```js
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from "three-mesh-bvh";

THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;
```

## The steepness analysis

The base idea of the analysis is to generate a x,y grid on top of the terrain.
And for each of the x,z position generate a vector above the terrain pointing
directly downwards. Then we raycast from the vector in the downward direction
onto the terrain. This will give us the triangle for the x,y position. We now
calculate the inclination of the triangle to get the steepness of the terrain
in this position.

The target of this analysis is to color the terrain with a color scale based
on the steepness. So the output of this analysis needs to be a HTMLCanvasElement
that we pass to the `Forma.terrain.groundTexture.add` method. We will use a
Float32Array as an intermediate result. This array will hold the steepness for 
each point as a number representing the radians of the angle compared with a flat
surface. So a flat x,y would have the value 0 and a 90 degree would be PI / 2. 

### Generating the grid.

We start by calculating the x,y bounds of the terrain. This will give us the range
for the x,y grid. 

We can get the x and y values of the terrain with the following code: 

```js
const xValues = triangles.filter((_, i) => i % 3 === 0);
const yValues = triangles.filter((_, i) => i % 3 === 1);
```

We can now define the grid as min(xValues)-max(xValues) and min(yValues)-max(yValues). 
The width of the grid would be max(xValues) - min(xValues). When we are going to draw 
this to the terrain later we need to choose a scale in the x,y domain. This means choosing
how large the distance between each grid point on the terrain.

Note: a terrain in Forma will usually have x,y values in the domain [-2000,2000]. 

### Calculating the steepness

Given a `x`, `y` coordinate we can calculate the steepness in the point
using the following piece of code.

```js
const raycaster = new THREE.Raycaster();
raycaster.firstHitOnly = true;

const interection = raycaster.intersectObject([mesh])
if (intersection) {
    const normal = intersection.face.normal

    const slope = Math.abs(Math.PI / 2 - Math.aton(normal.z / Math.sqrt(Math.pow(normal.x, 2) + Math.pow(normal.y, 2))));
}
```

## Visualizing the result

This part assumes that you have the following variables available from the previous part. 
 - `grid` a Float32Array
 - `width` the width of the grid
 - `height` the height of the grid


You start by creating a HTMLCanvasElement from the grid like this:
```js
const colors = [
  "rgba(169, 189, 5, 0.9)",
  "rgba(153, 181, 6, 0.9)",
  "rgba(136, 172, 7, 0.9)",
  "rgba(39, 123, 12, 0.9)",
  "rgba(120, 164, 8, 0.9)",
  "rgba(104, 156, 9, 0.9)",
  "rgba(88, 148, 9, 0.9)",
  "rgba(72, 140, 10, 0.9)",
  "rgba(55, 131, 11, 0.9)",
  "rgba(23, 115, 13, 0.9)",
];

export function createCanvasFromSlope(grid, width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  const colorGrading = threshold / colors.length;
  for (let i = 0; i < terrainSlope.length; i++) {
    const x = Math.floor(i % width);
    const y = Math.floor(i / width);
    let color = colors[Math.floor((terrainSlope[i] - minSlope) / colorGrading)];
    if (Math.abs(terrainSlope[i]) > threshold) {
      color = "red";
    }
    ctx!.fillStyle = color;
    ctx!.fillRect(x, y, 1, 1);
  }

  return canvas;
}
```

With this canvas you can use the `Forma.terrain.groundTexture.add` method 
to draw this on the texture on the terrain. 