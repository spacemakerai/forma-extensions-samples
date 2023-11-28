import { extrudePolygon } from "geometry-extrude";

export async function runGenerator(input) {
  const { indices, position } = extrudePolygon(
    [[input.values.polygon.points]],
    {
      depth: input.values.height,
    }
  );

  return {
    mesh: {
      verts: position,
      faces: indices,
    },
  };
}
