import { Analysis } from "forma-embedded-view-sdk/analysis";
import { Forma } from "forma-embedded-view-sdk/auto";
import { useState } from "preact/hooks";
import AnalysisPicker from "./components/AnalysisPicker";
import TimePicker from "./components/TimePicker";
import TriggerCalculation from "./components/TriggerCalcuation";

function useSunAnalysis(projectId: string) {
  const [analysis, setAnalysis] = useState<Analysis[] | undefined>();
  const [proposalId, setProposalId] = useState<string>();
  if (!proposalId) {
    Forma.proposal.getId().then(setProposalId);
  }
  if (!analysis && proposalId) {
    Forma.analysis
      .list({
        authcontext: projectId,
      })
      .then((analysis) => {
        setAnalysis(
          analysis.filter(
            (analysis) =>
              analysis.analysisType === "sun" && analysis.status === "SUCCEEDED" && analysis.proposalId === proposalId,
          ),
        );
      });
  }
  return analysis;
}

const projectId = Forma.getProjectId();

export default function App() {
  const analysis = useSunAnalysis(projectId);
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | undefined>();
  const [evaluateHour, setAnalysisHour] = useState<number>(12);
  const [evaluateMinute, setEvaluateMinute] = useState<number>(0);
  if (!analysis) {
    return <div>loading...</div>;
  }
  if (!projectId) {
    return <div>No project ID, can't fetch analysis</div>;
  }

  return (
    <div>
      <h1>Calculate sunlit points for specific time of day</h1>
      <AnalysisPicker
        analysis={analysis}
        selectedAnalysis={selectedAnalysis}
        setSelectedAnalysis={setSelectedAnalysis}
      />
      <TimePicker hour={evaluateHour} minute={evaluateMinute} setHour={setAnalysisHour} setMinute={setEvaluateMinute} />
      <TriggerCalculation selectedAnalysis={selectedAnalysis} hour={evaluateHour} minute={evaluateMinute} />
    </div>
  );
}
