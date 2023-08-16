import React from "react";
import { FDKLink } from "fdk-core/components";
import { getGlobalConfigValue } from "../helper/utils";

export function Component({ props, globalConfig }) {
  let margin_bottom = getGlobalConfigValue(
    globalConfig,
    "section_margin_bottom"
  );
  const { label, url, target } = props;
  return target.value === "_blank" ? (
    <a
      href={url.value}
      target={target.value}
      style={{ marginBottom: `${margin_bottom}px` }}
    >
      {label.value}
    </a>
  ) : (
    <FDKLink to={url.value} style={{ marginBottom: `${margin_bottom}px` }}>
      {label.value}
    </FDKLink>
  );
}

export const settings = {
  label: "Link",
  props: [
    {
      id: "label",
      label: "Link Label",
      type: "text",
      default: "Section Link",
      info: "Label to show for link",
    },
    {
      id: "url",
      label: "URL",
      type: "text",
      default: "/",
      info: "URl for link",
    },
    {
      id: "target",
      label: "Link Target",
      type: "text",
      default: "",
      info: "HTML target attribute for link",
    },
  ],
  blocks: [],
};
