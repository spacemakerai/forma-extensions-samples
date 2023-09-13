import { Forma } from "forma-embedded-view-sdk/auto";
import { useEffect, useState } from "preact/hooks";

export function App() {
  const [proposalId, setProposalId] = useState("");
  const [rootUrn, setRootUrn] = useState("");
  const [buildings, setBuildings] = useState<string[] | undefined>();
  const [siteLimits, setSiteLimits] = useState<string[] | undefined>();

  const projectId = Forma.getProjectId();

  useEffect(() => {
    const fetchData = async () => {
      Forma.proposal.getId().then((res) => setProposalId(res));
      Forma.proposal.getRootUrn().then((res) => setRootUrn(res));
      Forma.geometry
        .getPathsByCategory({ category: "buildings" })
        .then((res) => setBuildings(res));
      Forma.geometry
        .getPathsByCategory({ category: "site_limit" })
        .then((res) => setSiteLimits(res));
    };

    fetchData();
  }, []);

  const onClickChange = async () => {
    for (let building of buildings) {
      const r = Math.floor(Math.random() * 255);
      const g = Math.floor(Math.random() * 255);
      const b = Math.floor(Math.random() * 255);
      const position = await Forma.geometry.getTriangles({ path: building });
      const color = new Uint8Array((position.length / 3) * 4);
      for (let i = 0; i < position.length / 3; i += 3) {
        color[i * 4 + 0] = color[i * 4 + 4] = color[i * 4 + 8] = r;
        color[i * 4 + 1] = color[i * 4 + 5] = color[i * 4 + 9] = g;
        color[i * 4 + 2] = color[i * 4 + 6] = color[i * 4 + 10] = b;
        color[i * 4 + 3] = color[i * 4 + 7] = color[i * 4 + 11] = 255;
      }
      const geometryData = { position, color };
      Forma.render.updateMesh({ id: building, geometryData });
    }
  };
  const onClickReset = async () => {
    for (let building of buildings) {
      Forma.render.remove({ id: building });
    }
  };

  return (
    <>
      <div class="section">Project ID: {projectId}</div>
      <div class="section">Proposal ID: {proposalId}</div>
      <div class="section">Root URN: {rootUrn}</div>
      <div class="section">
        <p>Buildings: {buildings?.length}</p>
        <p>Site limits: {siteLimits?.length}</p>
      </div>
      <div class="section">
        <button onClick={onClickChange}>Color buildings</button>
        <button onClick={onClickReset}>Reset</button>
      </div>
    </>
  );
}
