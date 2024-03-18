import React, { useEffect } from 'react';

import { useParams } from 'react-router-dom';

import { useGlobalStore } from "fdk-core/utils";

import styles from '../styles/style.css';

console.log({React, useParams, useGlobalStore, styles });

export function ReviewRating() {

    const { slug } = useParams();
  
    const refresh = () => {
        window.fpi.configuration.fetchApplication().then(data => {
            console.log('Data from API : ', data)
        });
    }
    
    return (
        <div>
            <h1>Review and Rating Extension  for Sky🔥</h1>
            <p>⭐⭐⭐⭐⭐</p>
            <button onClick={() => refresh(slug)}>Click to fetch application data</button>
        </div>
    );
}

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