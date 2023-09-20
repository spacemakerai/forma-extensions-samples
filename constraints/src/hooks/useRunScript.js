import { useState, useEffect } from "https://esm.sh/preact/hooks";
import * as Dynamo from "../dynamo/dynamo.js";

export function useRunScript(rule, state, isInitialized) {
  const [result, setResult] = useState({ type: "init" });
  useEffect(async () => {
    if (isInitialized) {
      setResult({ type: "running" });
      try {
        const { type, data } = await Dynamo.run(rule, state);
        if (type === "success") {
          setResult({ type: "success", data });
        } else {
          console.warn("request aborted");
        }
      } catch (e) {
        console.error(e);
        setResult({ type: "error", error: e });
      }
    }
  }, [JSON.stringify(state), isInitialized]);

  return result;
}
