import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/product-card.less';

function ProductCard({
	name,
	description,
	slug,
	medias,
	brand,
}) {
	return (
		<Link to={`/product/${slug}`}>
			<div className={styles.card}>
				<img src={medias?.[0]?.url} alt={medias[0]?.alt} />
				<p>{brand?.name}</p>
				<h2>{name}</h2>
				<h4>{description}</h4>
			</div>
		</Link>

	);
}

export default ProductCard;
