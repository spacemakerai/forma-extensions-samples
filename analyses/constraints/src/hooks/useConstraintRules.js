import { Forma } from "https://esm.sh/forma-embedded-view-sdk/auto";
import { useState, useCallback } from "https://esm.sh/preact/hooks";

let defaultRules = [];
if (localStorage.getItem("rules-" + Forma.getProjectId())) {
  defaultRules = JSON.parse(
    localStorage.getItem("rules-" + Forma.getProjectId())
  );
}

function makeId() {
  return Math.random().toString(36).substring(2, 9);
}

export function useConstraintRules() {
  const [rules, setRules] = useState(defaultRules);

  const addRule = useCallback((rule) => {
    setRules((rules) => {
      const newRules = [
        ...rules,
        {
          id: makeId(),
          ruleId: rule.Uuid,
        },
      ];
      localStorage.setItem(
        "rules-" + Forma.getProjectId(),
        JSON.stringify(newRules)
      );
      return newRules;
    });
  }, []);

  const removeRule = useCallback((id) => {
    setRules((rules) => {
      const newRules = rules.filter((rule) => rule.id !== id);
      localStorage.setItem(
        "rules-" + Forma.getProjectId(),
        JSON.stringify(newRules)
      );
      return newRules;
    });
  });

  return [rules, addRule, removeRule];
}
