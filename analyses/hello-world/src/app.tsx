import { Forma } from "forma-embedded-view-sdk/auto";
import { EXPERIMENTAL_GeometryApi } from "forma-embedded-view-sdk/experimental";
import { useCallback } from "preact/hooks";

const expGeoApi = new EXPERIMENTAL_GeometryApi(Forma.getIframeMessenger());

export function App() {
  const onClick = useCallback(async () => {
    const urn = await Forma.proposal.getRootUrn();
    const paths = await Forma.selection.getSelection();

    console.log(
      JSON.stringify(
        await expGeoApi.EXPERIMENTAL_getVolume25DCollection({
          urn,
          path: paths[0],
        })
      )
    );
  }, []);

  const onClickFloors = useCallback(async () => {
    const urn = await Forma.proposal.getRootUrn();
    const paths = await Forma.geometry.getPathsByCategory({
      category: "building",
    });

    for (const path of paths) {
      console.log(
        await expGeoApi.EXPERIMENTAL_getVolume25DCollection({
          urn,
          path,
        })
      );
    }
  }, []);

  return (
    <>
      <h1>Hello</h1>

      <button onClick={onClick}>btn</button>
      <button onClick={onClickFloors}>floors</button>

      <br></br>
    </>
  );
}
