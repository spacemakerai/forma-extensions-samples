import { ComponentChildren, JSXIn } from "preact";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "weave-button": {
        disabled?: boolean;
        onClick?: () => void;
        children?: ComponentChildren;
        style?: string;
        variant: "outlined" | "solid" | "flat";
      };
      "weave-select": {
        placeholder?: string;
        onChange?: (e: CustomEvent) => void;
        children?: ComponentChildren;
        style?: string;
        value?: string;
      };
      "weave-select-option": {
        children?: ComponentChildren;
        style?: string;
        key?: string;
        value: string;
      };
      "forma-header": {
        children?: ComponentChildren;
        style?: string;
        variant?: "primary" | "secondary" | "tertiary" | "project-header";
        key?: string;
      };
      "weave-accordion": {
        children?: ComponentChildren;
        style?: string;
        label?: string;
      };
      "weave-input": {
        children?: ComponentChildren;
        onChange?: (e: CustomEvent) => void;
        style?: string;
        label?: string;
        disabled?: boolean;
        type?: string;
        value?: string;
        unit?: string;
        variant?: string;
        step?: string;
      };
      "forma-select-native": {
        onChange?: (e: CustomEvent) => void;
        children?: ComponentChildren;
        style?: string;
        value?: string;
        disabled?: boolean;
      };
      "weave-progress-bar": {};
      "weave-checkbox": {
        onChange?: (e: CustomEvent) => void;
        children?: ComponentChildren;
        style?: string;
        checked: boolean;
        showlabel?: boolean;
        label?: string;
        value?: string;
        key?: string;
        disabled?: boolean;
      };
      "weave-chevron-down": {
        onClick?: () => void;
        style?: string;
      };
      "forma-help-16": {
        style?: string;
        id?: string;
      };
      "weave-tooltip": {
        text: string;
        element?: string;
        description?: string;
        children?: ComponentChildren;
        nub?: string;
        width?: string;
        style?: string;
      };
      "weave-radio-button-group": {
        name: string;
        children?: ComponentChildren;
        onChange?: (e: CustomEvent<HTMLInputElement>) => void;
      };
      "weave-radio-button": {
        value?: string;
        checked?: boolean;
        label?: string;
        children?: ComponentChildren;
        style?: string;
        id?: string;
      };
      "weave-inputslider": {
        children?: ComponentChildren;
      };
      "weave-slider": {
        onChange?: (e: CustomEvent) => void;
        value?: string;
        min?: string;
        max?: string;
        step?: string;
        variant?: "continuous" | "discrete";
        label?: string;
        style?: string;
      };
      "forma-check": {};
      "weave-toggle": {
        style?: string;
        toggled?: boolean;
        id?: string;
        onChange?: () => void;
      };
      "forma-tabs": {
        selectedtab?: number;
        gap?: string;
        children?: ComponentChildren;
        onChange?: (e: CustomEvent) => void;
      };
      "forma-tab": {
        for?: string;
        hpadding?: string;
        label?: string;
        disabled?: boolean;
      };
    }
  }
}
