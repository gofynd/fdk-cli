import React from "react";
import { getGlobalConfigValue } from "../helper/utils";

export function Component({ props, blocks, globalConfig }) {
  console.log("globalConfig",globalConfig);
  let margin_bottom = getGlobalConfigValue(
    globalConfig,
    "section_margin_bottom"
  );
  const { imageUrl, alt, width = 100 } = props;
  return (
    <div style={{ marginBottom: `${margin_bottom}px` }}>
      <img
        src={imageUrl.value}
        alt={alt.value}
        style={{ width: `${width.value}%` }}
      />
    </div>
  );
}

export const settings = {
  label: "Banner",
  props: [
    {
      id: "imageUrl",
      label: "Banner Image Link",
      type: "text",
      default: "",
      info: "Link to the image that should be displayed in banner",
    },
    {
      id: "alt",
      label: "Alt Text",
      type: "text",
      default: "Image Alt",
      info: "Image Alt",
    },
    {
      id: "width",
      label: "Image Width",
      type: "text",
      default: "100",
      info: "Width of image in %",
    },
  ],
  blocks: [],
};
