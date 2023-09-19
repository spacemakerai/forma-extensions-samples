import { useState, useEffect } from "https://esm.sh/preact/compat";

export function useAllConstraints() {
  const [allRules, setAllRules] = useState([]);

  useEffect(async () => {
    const rules = await Promise.all(
      [
        { id: "constraints", filename: "ConstraintConflicts.json" },
        { id: "facade-minumum", filename: "FacadeMinimumDistance.json" },
      ].map(async ({ id, filename }) => {
        const code = await fetch("src/rules/" + filename).then((res) =>
          res.json()
        );

        return {
          id,
          ruleId: code.Uuid,
          code,
        };
      })
    );
    setAllRules(rules);
  }, []);
  return allRules;
}
