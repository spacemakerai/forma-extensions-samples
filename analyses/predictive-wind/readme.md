# Vanilla TS Example for Wind Prediction

This directory is a simple example of how to do wind predictions from an embedded view.

- get desired position using `Forma.designTool.getPoint()`
- Generate height maps using raycasting in `generateHeightMaps`
- Perform predition using `Forma.predictiveAnalysis.predictWind`
- Draw results to scene using `Forma.terrain.groundTexture.add`

There has been done simple sanity check of comparing results from this approach with the built in feature, but make no promises that the exact same geometry is included in the height map.

This codebase to the left. Native feature to right. Screenshot taken February 27th, 2024.
Note that there is expected to be slight differences as the height map generation technique is different, and the extension texture does not look as crisp.
![Screenshot 2024-02-27 at 08 57 02](https://github.com/spacemakerai/forma-extensions-samples/assets/95701996/88478d9a-0695-4c49-b47a-964e99d02442)

## Usage

This repository uses `yarn` as package manager. Run `yarn` to install dependencies, and `yarn dev` to start the development server. It will then run on `http://localhost:5173`.

Configure your extension to load `localhost:5173`, and open the extension.

See https://aps.autodesk.com/en/docs/forma/v1/overview/getting-started/ for more information on how to getting started.
