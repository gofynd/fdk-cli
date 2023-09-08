import React from "react";
import { getGlobalConfigValue } from "../helper/utils";

export function Component({ props, globalConfig }) {
  console.log("globalConfig",globalConfig);

  let margin_bottom = getGlobalConfigValue(
    globalConfig,
    "section_margin_bottom"
  );
  const { code } = props;

  return !code?.value ? null : (
    <div
      dangerouslySetInnerHTML={{ __html: code.value }}
      style={{ marginBottom: `${margin_bottom}px` }}
    />
  );
}

export const settings = {
  label: "Raw HTML",
  props: [
    {
      id: "code",
      label: "Your Code Here",
      type: "code",
      default: "",
      info: "Add Your custom HTML Code below. You can also use the full screen icon to open a code editor and add your code",
    },
  ],
  blocks: [],
};
