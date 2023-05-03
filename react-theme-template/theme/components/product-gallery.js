import React from 'react';
import ProductCard from './product-card';
import styles from '../styles/product-gallery.less';

function ProductGallery({
	products,
}) {
	console.log({ products });
	if (products?.length) {
		return (
			<div className={styles['product-gallery']}>
				{
					products.map((product, index) => (
						<ProductCard
							// eslint-disable-next-line react/no-array-index-key
							key={product.slug + index}
							{
								...product
							}
						/>
					))
				}
			</div>
		);
	}
}

export default ProductGallery;
