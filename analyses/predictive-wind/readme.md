# Vanilla TS Example for Wind Prediction

This directory is a simple example of how to do wind predictions from an embedded view.

- get desired position using `Forma.designTool.getPoint()`
- Generate height maps using raycasting in `generateHeightMaps`
- Perform predition using `Forma.predictiveAnalysis.predictWind`
- Draw results to scene using `Forma.terrain.groundTexture.add`

There has been done simple sanity check of comparing results from this approach with the built in feature, but make no promises that the exact same geometry is included in the height map.

## Usage

This repository uses `yarn` as package manager. Run `yarn` to install dependencies, and `yarn dev` to start the development server. It will then run on `http://localhost:5173`.

Configure your extension to load `localhost:5173`, and open the extension.

See https://aps.autodesk.com/en/docs/forma/v1/overview/getting-started/ for more information on how to getting started.
