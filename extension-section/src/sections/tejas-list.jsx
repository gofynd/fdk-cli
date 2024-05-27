import React from "react";

import { useGlobalStore, useFPI } from "fdk-core/utils";

const URL = 'https://gateway.marvel.com/v1/public/characters?ts=1&apikey=4a40a80e7fad0f5ea718e9cbcf2c173a&hash=cfd80e8a251049399a1ac595e66a3820';
export function Component({ props }) {
  const fpi = useFPI();

  const customData = useGlobalStore(fpi.getters.CUSTOM_VALUE);

  const {count, results} = customData?.extensionList ?? {};
  const title = props?.title?.value ?? 'Extension Title Default';

React.useEffect(() => {
  if(!results?.length) {
    fetch(URL)
  .then(res => res.json())
  .then((response) => {
    const {data} = response || {};

    fpi.custom.setValue('extensionList', data);
  }).catch(error => {
    console.error(error)
  })
  }
}, []);

if(!results?.length) {
  return <h3>Loading Items ....</h3>
}

  return (
    <div>
      <h1>Extension Section : {title}</h1>
      <p>Showing {count} items: </p>
      <div style={{display: 'flex', flexWrap: 'wrap'}}>
      {
        results.map((item) => (
           <div style={{margin: '5px'}}>
           <img src={ `${item.thumbnail.path}.${item.thumbnail.extension}` } width={'200px'} height={'200px'} />
            <p>{item.name}</p>
           </div>
        ))
      }
      </div>
    </div>
  );
}

Component.serverFetch = async ({ fpi }) => {
  return fetch(URL)
  .then(res => res.json())
  .then((response) => {
    const {data} = response || {};

    fpi.custom.setValue('extensionList', data);
  }).catch(error => {
    console.error(error)
  })
}

export const settings = {
  label: "Demo List",
  name: "demo-list",
  props: [
    {
      id: "title",
      label: "Page Title",
      type: "text",
      default: "Extension Title",
      info: "Page Title",
    },
  ],
  blocks: [],
};
