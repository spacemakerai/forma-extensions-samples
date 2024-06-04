import { Analysis } from "forma-embedded-view-sdk/analysis";

type Props = {
  analysis: Analysis[];
  selectedAnalysis: Analysis | undefined;
  setSelectedAnalysis: (analysis: Analysis) => void;
};

export default function AnalysisPicker({ analysis, selectedAnalysis, setSelectedAnalysis }: Props) {
  return (
    <>
      <div class="section">
        <h1>Select analysis</h1>
        <select
          class="medium"
          required
          value={selectedAnalysis?.analysisId ?? ""}
          onChange={(e) => {
            const selected = analysis.find((a) => a.analysisId === e.currentTarget.value);
            if (selected) {
              setSelectedAnalysis(selected);
            }
          }}
        >
          <option selected disabled value="">
            Select your analysis
          </option>
          {analysis.map((a) => (
            <option value={a.analysisId}>{a.updatedAt}</option>
          ))}
        </select>
      </div>
    </>
  );
}
