import { Forma } from "forma-embedded-view-sdk/auto";

const projectId = Forma.getProjectId();

export function App() {
  return <h1>Hello, AECTech: {projectId}!</h1>;
}
