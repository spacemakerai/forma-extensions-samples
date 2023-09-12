import { useState } from "https://esm.sh/preact/compat";

export function useCalculateConflicts(config) {
  const [state, setState] =
    useState < { type: "initializing" } |
    { type: "loading" } |
    { type: "success", data: any } |
    ({ type: "failed", error: string } > ({ type: "initializing" });

  useEffect(async () => {
    let rootUrn = await Forma.proposal.getRootUrn();
    const id = setInterval(async () => {
      setState({ type: "loading" });
      const urn = await Forma.proposal.getRootUrn();
      if (urn !== rootUrn) {
        const geometry = {
          proposal: await getProposal(),
          surroundings: await getSurroundings(),
          constraints: await getConstraints(),
        };
        try {
          setState({
            type: "sucess",
            data: await Dynamo.run(config, geometry),
          });
        } catch (e) {
          setState({ type: "failed", error: e.toString() });
        }
        rootUrn = urn;
      }
    }, 1000);

    return () => clearInterval(id);
  }, [config]);

  return state;
}
