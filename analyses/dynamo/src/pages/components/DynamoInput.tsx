import { useCallback } from "preact/compat";
import { Forma } from "forma-embedded-view-sdk/auto";

function DynamoSelection({ input, value, setValue }: any) {
  const onSelect = useCallback(async () => {
    setValue(input.id, await Forma.selection.getSelection());
  }, [input]);

  return (
    <>
      {value && <span>{value.length} Selected</span>}
      <button onClick={onSelect}>Select</button>
    </>
  );
}

function DynamoInputComponent({ input, value, setValue }: any) {
  if (input.name === "Triangles" || input.name === "Footprint") {
    return (
      <DynamoSelection
        input={input}
        setValue={setValue}
        value={value}
      ></DynamoSelection>
    );
  } else if (input.type === "StringInput") {
    return (
      <input
        type="text"
        defaultValue={value}
        // @ts-ignore
        onChange={(ev) => setValue(input.id, ev.target.value)}
      />
    );
  } else if (input.type === "BoolSelector") {
    return (
      <input
        type="checkbox"
        defaultChecked={value}
        // @ts-ignore
        onChange={(ev) => setValue(input.id, ev.target.checked)}
      />
    );
  } else if (input.type === "DoubleSlider") {
    return (
      <>
        <input
          type="range"
          min={input.minimumValue}
          max={input.maximumValue}
          step={input.stepValue}
          defaultValue={value}
          // @ts-ignore
          onChange={(ev) => setValue(input.id, ev.target.value)}
        />
        <span>{value}</span>
      </>
    );
  } else if (input.type === "DoubleInput") {
    return (
      <input
        type="number"
        defaultValue={value}
        // @ts-ignore
        onChange={(ev) => setValue(input.id, ev.target.value)}
      />
    );
  } else if (input.type === "DSDropDownBase") {
    return (
      <select
        // @ts-ignore
        onChange={(ev) => setValue(input.id, ev.target.value)}
        defaultValue={input.value.split(":")[1]}
      >
        {input.nodeTypeProperties.options.map((name: string) => (
          <option value="{name}">{name}</option>
        ))}
      </select>
    );
  } else {
    console.log(input);
    return null;
  }
}

type Input = {
  id: string;
  name: string;
  type: string;
  value: string;
  minimumValue: number;
  maximumValue: number;
  stepValue: number;
  nodeTypeProperties: {
    options: string[];
  };
};

export function DynamoInput({ code, state, setValue }: any) {
  return code.inputs.map((input: Input) => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "5px",
        paddingBottom: "5px",
      }}
      key={input.id}
    >
      {input.name}
      <DynamoInputComponent
        input={input}
        value={state[input.id]}
        setValue={setValue}
      />
    </div>
  ));
}
