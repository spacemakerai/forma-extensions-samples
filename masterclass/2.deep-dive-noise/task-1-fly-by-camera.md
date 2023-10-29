# Trigger and visualize noise results

In this task we will make a simple camera animator. We will register key frames, by moving the camera
in the scene and storing these. Then we will replay these frames. 

...Insert end goal picture here...

APIs: `CameraAPI`

## Getting set up

Copy the `task-template` folder and name it `task-1`.

## Storing key frames

First create a button, and give it a click listener. Inside the listener
you can use the `Forma.camera.getCurrent` api to get the current camera
position. Store this in a list of camera positions.

The following code example stores a value in a list each time the button 
is clicked in `react/preact`

```js
function Component() {
    const [list, setList] = useState([]);

    const onClick = useCallback(() => { // you will need to make this arrow function async
        setList(list => ([...list, "new value"]))
    }, [setList])

    return (
        <button onClick={onClick}>Click me!</button>
    )
}
```

## Replaying the movements

With the `Forma.camera.move` method we can move the camera it a new location.
This method takes both a position and a millisecond transition time. 

Another nice property of the move is that the promise it returns will resolve 
when the transition is done. This means that a fly-by animation is as simple as a 
for loop over the positions

```js
const transitionTimeMs = 2000

for (let ({position, target}) of states) {
    await Forma.camera.move({position, target, transitionTimeMs})
}

```

For convenience we could add a button to start this animation, and to clear 
the list of camera positions. 

## Bonus task

It would be nice if we could record a single animation and use it across
mutliple proposals.

For this we can the browser builtin `localStorage` or `sessionStorage`. These
will be local to the current user. The `Forma` api also exposes a way to store
data on `Forma.extensions.storage`. This storage is scoped to your extension 
and the current project of the user. 