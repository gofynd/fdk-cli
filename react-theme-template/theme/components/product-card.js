import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/product-card.less';

function ProductCard({
	name,
	description,
	slug,
	media,
	isWishlisted,
	handleWishlistButton,
}) {
	const navigate = useNavigate();

	const handleProductClick = (event) => {
		event.preventDefault();
		navigate(`/product/${slug}`);
	};

	return (
		<div className={styles['product-card']}>
			<a href={`/product/${slug}`} onClick={handleProductClick}>
				<img src={media?.url} alt={media?.alt} />
				<h2>{name}</h2>
				<h4>{description}</h4>
			</a>
			{
				handleWishlistButton
					? (
						<button
							onClick={() => handleWishlistButton(slug)}
						>

							Like
							{
								isWishlisted ? '💖' : ''
							}
						</button>
					)
					: null
			}
		</div>
	);
}

export default ProductCard;
