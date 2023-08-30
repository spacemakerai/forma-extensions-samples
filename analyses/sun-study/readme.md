# This is an example forma extension by Autodesk

This extension is built using the **Forma SDK for Javascript** using an `Embedded View` in the `Right hand side analaysis panel`

**What is does:** Lets the user select a time range, date, and inverval to generate a sun study for. 

## How was this built

The extension is composed by 3 files, `index.html`, `script.js` and `style.css` just like most web applications. It is deployed to static hosting on github pages and installed as an extension into Forma. It uses three methods of the Forma API and the rest is built using plain javascript, html and css. 

This document will go through step by step how you would build the main functionality of this extension. In the walkthrough we will only be using a single `index.html` with an inline `script` tag for the code. The code in this repo is a real extension that we expose to our users so we will gloss over the non Forma specific parts which makes it user friendly. The extension is written without any libraries (except the Forma SDK), and thus the code is quite verbose. We would encourage using a modern UI stack to build extension.

### Step one - the staring point

The starting point of this extension is the following files: 

`index.html`
```html
<!DOCTYPE html>
<html>

<head>
    </head>
    <body>
        <script type="module">
          import formaApi from "https://app.autodeskforma.eu/extensions/preview/sdk.js"
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
So add the following to the `script.js` file

```js
await formaApi.ui.sun.set(new Date())
```

Here you can see that the `sun` api, which has a `set` and `get` method is located under
the `ui` name space in the api. You can also see that the input (and output) date for this api is a javascript date object. We use the `await` key word here as all methods in the SDK
are `async`. This is because the implementation is using an asynchronous message protocol to
communicate with Forma. 

If you load this extension in your application this should set the sun position to the current time of day as your computer.

### Step three - taking a screenshot

The next call that we will add is to take a screenshot of the current view. This
can be done by asking the `camera` to take a picture. It will use the current 
camera position from the application. (This can programtically be set by the `camera` api).

```js
const dataUrl = await formaApi.ui.camera.capture(1024, 768);
```

You can see that we provide the resolution of the camera to the api call. The return 
type of this method is a data url with an encode png picture. 

### Step four - storing the screenshot

We can use the following snippet to store this as a file.

```js
const save_link = document.createElement("a");
save_link.href = url;
save_link.download = "screenshot.png";
const event = new MouseEvent("click", { bubbles: false, cancelable: false });
save_link.dispatchEvent(event);
```

### Step five - Resetting the original sun position

To tie this altogether we capture the original sun position before and reset it after:

```js
const original = await formaApi.ui.sun.get()


// ...


await formaApi.ui.sun.set(original);

```