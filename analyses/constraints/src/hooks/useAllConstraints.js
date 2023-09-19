import { useState, useEffect, useCallback } from "https://esm.sh/preact/compat";

let storedScripts = [];
try {
  storedScripts = JSON.parse(
    localStorage.getItem("dynamo-constraints") || "[]"
  );
} catch (e) {}

export function useAllConstraints() {
  const [allConstraints, setAllConstraints] = useState(storedScripts);

  useEffect(async () => {
    const builtInConstraints = await Promise.all(
      [
        { id: "constraints", filename: "ConstraintConflicts.json" },
        { id: "facade-minumum", filename: "FacadeMinimumDistance.json" },
      ].map(async ({ id, filename }) => {
        const code = await fetch("src/built-in-constraints/" + filename).then(
          (res) => res.json()
        );

        return {
          id,
          ruleId: code.Uuid,
          code,
        };
      })
    );
    setAllConstraints((constraints) => [...constraints, ...builtInConstraints]);
  }, [setAllConstraints]);

  const addConstraint = useCallback(
    (constraint) => {
      localStorage.setItem(
        "dynamo-constraints",
        JSON.stringify([...storedScripts, constraint])
      );
      setAllConstraints((allConstraints) => [...allConstraints, constraint]);
    },
    [setAllConstraints]
  );

  return [allConstraints, addConstraint];
}
