# This is an example extension for Autodesk Forma

This extension is built using the **[Forma SDK for Javascript](https://aps-dev.autodesk.com/en/docs/forma/v1/reference/embedded-view-sdk/)** using an `Embedded View` in the `Right hand side analysis panel`

**What it does:** Lets the user select a time range, date, and inverval to generate a sun study consisting of screenshots of the selected sun positions. 

## How was this built

The extension is composed by 3 files, `index.html`, `script.js` and `style.css` just like most web applications. It is deployed to static hosting on github pages and installed as an extension into Forma. It uses three methods of the Forma API and the rest is built using plain javascript, html and css. 

This document will go through step by step how you would build the main functionality of this extension. In the walkthrough we will only be using a single `index.html` with an inline `script` tag for the code. The code in this repo is a real extension that we expose to our users so we will gloss over the non Forma specific parts which makes it user friendly. The extension is written without any libraries (except the Forma SDK), and thus the code is quite verbose. We encourage using a modern UI stack to build extension.

### Step one - the starting point

The starting point of this extension is the following file: 

`index.html`
```html
<!DOCTYPE html>
<html>

<head>
    </head>
    <body>
        <script type="module">
          import { Forma } from "https://esm.sh/forma-embedded-view-sdk/auto";
        </script>
    </body>
</html>
```

### Step two - Setting the sun position

The extension does the following three operations.
  1. Set the sun to a given position
  2. Take a screenshot of the current view
  3. Reset the sun to the original position

In this first step we will set the sun position to the current time of the users browser.
So add the following to the script tag

```js
await Forma.sun.setDate(new Date())
```

Here you can see that we use the `sun` api, which has the methods `setDate` and `getDate`. You can also see that the input (and output) date for this api is a javascript date object. We use the `await` key word here as all methods in the SDK are `async`. This is because the implementation is using an asynchronous message protocol to communicate with Forma. 

If you load this extension in your application this should set the sun position to the current time of day as your computer.

### Step three - taking a screenshot

The next call that we will add is to take a screenshot of the current view. This can be done by asking the `camera` to take a picture. It will use the current camera position from the application.

```js
const canvas = await Forma.camera.capture(1024, 768);
```

You can see that we provide the resolution of the camera to the api call. The return type of this method is a html canvas with the picture. 

### Step four - storing the screenshot

We can use the following snippet to store this as a file on the users computer.

```js
const save_link = document.createElement("a");
save_link.href = canvas.toDataUel("image/png");
save_link.download = "screenshot.png";
const event = new MouseEvent("click", { bubbles: false, cancelable: false });
save_link.dispatchEvent(event);
```

### Step five - Resetting the original sun position

To tie this altogether we capture the original sun position before and reset it after:

```js
const original = await Forma.sun.getDate()


// ...


await Forma.sun.setDate(original);

```
