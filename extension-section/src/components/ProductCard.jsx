import React from 'react';
import styles from '../styles/style.css';

export function ProductCard({ product }) {
    return (
        <div className={styles.product}>
            {product.medias.map((media) => (
                <img src={media.url} alt={media.alt} />
            ))}
            <h1>{product.name}</h1>
            <h2>{product.slug}</h2>
        </div>
    );
}
