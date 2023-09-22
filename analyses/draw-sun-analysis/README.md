# This is an example extension for Autodesk Forma

This extension is built using the **[Forma SDK for Javascript](https://aps-dev.autodesk.com/en/docs/forma/v1/reference/embedded-view-sdk/)** using an `Embedded View` in the `Right hand side analysis panel`

**What it does:** Lets the user select a given sun analysis for the proposal, and input a time of day to draw the sunlit points to the scene.

### Local testing

In order to work with this extension locally, make sure you have the [local testing extension](https://aps.autodesk.com/en/docs/forma/v1/developers_guide/local-testing-extension/) for Forma installed. Install dependencies using

```shell
yarn install
```

and then you just need to run

```shell
yarn run dev
```
