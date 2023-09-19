import { Forma } from "https://esm.sh/forma-embedded-view-sdk/auto";
import { useState, useCallback } from "https://esm.sh/preact/hooks";

let defaultRules = [];
if (localStorage.getItem("rules-" + Forma.getProjectId())) {
  defaultRules = JSON.parse(
    localStorage.getItem("rules-" + Forma.getProjectId())
  );
}

export function useSelectedConstraints() {
  const [constraints, setConstraints] = useState(defaultRules);

  const toggleConstraint = useCallback((constraint) => {
    setConstraints((constraints) => {
      if (constraints.find(({ id }) => constraint.id === id)) {
        const newConstraints = constraints.filter(
          ({ id }) => constraint.id !== id
        );
        localStorage.setItem(
          "rules-" + Forma.getProjectId(),
          JSON.stringify(newConstraints)
        );
        return newConstraints;
      } else {
        const newConstraints = [...constraints, constraint];
        localStorage.setItem(
          "rules-" + Forma.getProjectId(),
          JSON.stringify(newConstraints)
        );
        return newConstraints;
      }
    });
  }, []);

  return [constraints, toggleConstraint];
}
