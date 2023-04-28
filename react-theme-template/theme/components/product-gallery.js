import React from 'react';
import ProductCard from './product-card';
import styles from '../styles/product-gallery.less';

function ProductGallery({
	products,
}) {
	if (products?.length) {
		return (
			<div className={styles['product-gallery']}>
				{
					products.map((product, index) => (
						<ProductCard
							// eslint-disable-next-line react/no-array-index-key
							key={product.slug + index}
							name={product.name}
							description={product.short_description}
							slug={product.slug}
							media={product.medias[0]}
						/>
					))
				}
			</div>
		);
	}
}

export default ProductGallery;
