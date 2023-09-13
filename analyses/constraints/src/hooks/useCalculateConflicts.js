import { useState, useEffect, useCallback } from "https://esm.sh/preact/compat";
import { Forma } from "https://esm.sh/forma-embedded-view-sdk/auto";
import {
  getConstraints,
  getProposal,
  getSurroundings,
} from "../util/geometry.js";
import * as Dynamo from "../dynamo/dynamo.js";

/*
{ type: "initializing" }) 
{ type: "loading" } 
{ type: "success", data: any } 
{ type: "failed", error: string }
*/

export function useCalculateConflicts(config) {
  const [state, setState] = useState({ type: "initializing" });

  const call = useCallback(async () => {
    const geometry = {
      proposal: await getProposal(),
      surroundings: await getSurroundings(),
      constraints: await getConstraints(),
    };
    try {
      setState({ type: "loading" });
      const response = await Dynamo.run(config, geometry);

      const conflicts = response.info.outputs.find(
        ({ name }) => name === "Conflict"
      );

      if (conflicts.value) {
        setState({ type: "success", data: conflicts });
      } else {
        setState({ type: "failed", error: "Missing output value" });
      }
    } catch (e) {
      setState({ type: "failed", error: e.toString() });
    }
  }, [config]);

  useEffect(() => {
    call();
  }, [call]);

  useEffect(async () => {
    let rootUrn = await Forma.proposal.getRootUrn();
    const id = setInterval(async () => {
      const urn = await Forma.proposal.getRootUrn();
      if (urn !== rootUrn) {
        rootUrn = urn;
        await call();
      }
    }, 1000);

    return () => clearInterval(id);
  }, [config, call]);

  return state;
}
