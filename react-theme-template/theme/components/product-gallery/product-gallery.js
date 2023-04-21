import React from 'react';
import ProductCard from '../product-card/product-card';
import styles from './product-gallery.css';

function ProductGallery({
	products,
	handleWishlistButton,
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
							isWishlisted={product.isWishlisted}
							handleWishlistButton={handleWishlistButton}
							media={product.medias[0]}
						/>
					))
				}
			</div>
		);
	}
}

export default ProductGallery;
