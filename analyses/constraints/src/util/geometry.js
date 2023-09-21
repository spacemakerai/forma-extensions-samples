import { Forma } from "https://esm.sh/forma-embedded-view-sdk/auto";

export async function getProposal() {
  return (
    await Promise.all(
      [
        ...(await Forma.geometry.getPathsByCategory({ category: "building" })),
        ...(await Forma.geometry.getPathsByCategory({ category: "generic" })),
        ...(await Forma.geometry.getPathsByCategory({ category: null })),
      ]
        .filter((path) => path.split("/").length === 2)
        .map((path) => Forma.geometry.getTriangles({ path }))
    )
  ).map((a) => Array.from(a));
}

export async function getSurroundings() {
  return (
    await Promise.all(
      [
        ...(await Forma.geometry.getPathsByCategory({ category: "building" })),
        ...(await Forma.geometry.getPathsByCategory({ category: "generic" })),
        ...(await Forma.geometry.getPathsByCategory({ category: null })),
      ]
        .filter((path) => path.split("/").length === 3)
        .map((path) => Forma.geometry.getTriangles({ path }))
    )
  ).map((a) => Array.from(a));
}

export async function getConstraints() {
  return (
    await Promise.all(
      (
        await Forma.geometry.getPathsByCategory({
          category: "constraints",
        })
      ).map((path) =>
        Forma.geometry.getTriangles({
          path,
        })
      )
    )
  ).map((a) => Array.from(a));
}

export async function getSiteLimits() {
  const paths = await Promise.all(
    await Forma.geometry.getPathsByCategory({
      category: "site_limit",
    })
  );

  const footprints = await Promise.all(
    paths.map((path) => Forma.geometry.getFootprint({ path }))
  );

  return footprints.map(({ coordinates }) => coordinates);
}
