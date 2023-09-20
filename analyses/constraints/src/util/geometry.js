import { Forma } from "https://esm.sh/forma-embedded-view-sdk/auto";

export async function getProposal() {
  const rootUrn = await Forma.proposal.getRootUrn();

  return (
    await Promise.all(
      [
        ...(await Forma.geometry.getPathsByCategory({
          urn: rootUrn,
          category: "building",
        })),
        ...(await Forma.geometry.getPathsByCategory({
          urn: rootUrn,
          category: "generic",
        })),
        ...(await Forma.geometry.getPathsByCategory({
          urn: rootUrn,
          category: null,
        })),
      ]
        .filter((path) => path.split("/").length === 2)
        .map((path) =>
          Forma.geometry.getTriangles({
            urn: rootUrn,
            path,
          })
        )
    )
  ).map((a) => Array.from(a));
}

export async function getSurroundings() {
  const rootUrn = await Forma.proposal.getRootUrn();

  return (
    await Promise.all(
      [
        ...(await Forma.geometry.getPathsByCategory({
          urn: rootUrn,
          category: "building",
        })),
        ...(await Forma.geometry.getPathsByCategory({
          urn: rootUrn,
          category: "generic",
        })),
        ...(await Forma.geometry.getPathsByCategory({
          urn: rootUrn,
          category: null,
        })),
      ]
        .filter((path) => path.split("/").length === 3)
        .map((path) =>
          Forma.geometry.getTriangles({
            urn: rootUrn,
            path,
          })
        )
    )
  ).map((a) => Array.from(a));
}

export async function getConstraints() {
  const rootUrn = await Forma.proposal.getRootUrn();

  return (
    await Promise.all(
      (
        await Forma.geometry.getPathsByCategory({
          urn: rootUrn,
          category: "constraints",
        })
      ).map((path) =>
        Forma.geometry.getTriangles({
          urn: rootUrn,
          path,
        })
      )
    )
  ).map((a) => Array.from(a));
}

export async function getSiteLimits() {
  const rootUrn = await Forma.proposal.getRootUrn();

  const paths = await Promise.all(
    await Forma.geometry.getPathsByCategory({
      urn: rootUrn,
      category: "site_limit",
    })
  );

  const footprints = await Promise.all(
    paths.map((path) => Forma.geometry.getFootprint({ urn: rootUrn, path }))
  );

  return footprints.map(({ coordinates }) => coordinates);
}
