import React, { useEffect } from 'react';

import { useGlobalStore, useFPI } from "fdk-core/utils";

import styles from '../styles/style.css';

console.log({ useGlobalStore, styles });

export function Component() {

    const fpi = useFPI();
    const products = useGlobalStore(fpi.getters.PRODUCTS);

    console.log('Extension Code : ', products)
    
    return (
        <div>
            <h1>Product List using Extension for Sky🔥</h1>
        </div>
    );
}

Component.serverFetch = ({ fpi }) => fpi.product.fetchProductListing({});

export const settings = {
    label: "Raw HTML",
    name:'raw-html',
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