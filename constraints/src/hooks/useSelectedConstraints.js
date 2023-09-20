import { Forma } from "https://esm.sh/forma-embedded-view-sdk/auto";
import { useState, useCallback } from "https://esm.sh/preact/hooks";

let defaultSelectedConstraints = ["constraints"];
if (localStorage.getItem("selected-" + Forma.getProjectId())) {
  defaultSelectedConstraints = JSON.parse(
    localStorage.getItem("selected-" + Forma.getProjectId())
  );
}

export function useSelectedConstraints() {
  const [constraints, setConstraints] = useState(defaultSelectedConstraints);

  const toggleConstraint = useCallback((constraintId) => {
    setConstraints((constraints) => {
      if (constraints.find((id) => constraintId === id)) {
        const newConstraints = constraints.filter((id) => constraintId !== id);
        localStorage.setItem(
          "selected-" + Forma.getProjectId(),
          JSON.stringify(newConstraints)
        );
        return newConstraints;
      } else {
        const newConstraints = [...constraints, constraintId];
        localStorage.setItem(
          "selected-" + Forma.getProjectId(),
          JSON.stringify(newConstraints)
        );
        return newConstraints;
      }
    });
  }, []);

  return [constraints, toggleConstraint];
}
