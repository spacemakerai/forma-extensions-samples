import { useState, useCallback, useEffect } from "https://esm.sh/preact/hooks";
import {
  getConstraints,
  getProposal,
  getSiteLimits,
  getSurroundings,
} from "../util/geometry.js";

const automaticInputs = [
  "Proposal",
  "SiteLimits",
  "Surroundings",
  "Constraints",
  "Terrain",
];

const methods = {
  Proposal: getProposal,
  SiteLimits: getSiteLimits,
  Surroundings: getSurroundings,
  Constraints: getConstraints,
  //Terrain: getTerrain,
};

export function useAutomaticInputs(rule) {
  const [state, setState] = useState({});
  const [isInitialized, setInitialized] = useState(false);

  const automatic = rule.Inputs.filter(({ Type }) => Type === "string").filter(
    ({ Name }) => automaticInputs.includes(Name)
  );

  const call = useCallback(async () => {
    setState(
      Object.fromEntries(
        await Promise.all(
          automatic.map(async ({ Id, Name }) => {
            return [Id, JSON.stringify(await methods[Name]())];
          })
        )
      )
    );
  }, []);

  // Initial call
  useEffect(async () => {
    await call();
    setInitialized(true);
  }, [call]);

  // Call on proposal change
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
  });

  return [state, isInitialized];
}
