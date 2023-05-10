import React from 'react';
import { FDKLink } from 'fdk-core/components';
import styles from '../styles/product-card.less';

function ProductCard({
	name,
	description,
	slug,
	medias,
	brand,
}) {
	return (
		<FDKLink to={`/product/${slug}`}>
			<div className={styles.cardContainer}>
				<img src={medias[0]?.url} alt={medias[0]?.alt} />
				<p className={styles.brandName}>{brand?.name}</p>
				<p className={styles.name}>{name}</p>
				<h4>{description}</h4>
			</div>
		</FDKLink>

	);
}

export default ProductCard;
