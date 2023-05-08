import React from 'react';
import { FDKLink } from 'fdk-core/components';
import styles from '../styles/header.less';

function Header() {
	return (
		<nav className={styles.header}>
			<div className={styles['link-menu']}>
				<FDKLink to="/" className={styles.link}>Home</FDKLink>
				<FDKLink to="/products" className={styles.link}>Products</FDKLink>
				<FDKLink to="/brands" className={styles.link}>Brands</FDKLink>
				<FDKLink to="/collections" className={styles.link}>Collections</FDKLink>
				<FDKLink to="/cart" className={styles.link}>Cart</FDKLink>
				<FDKLink to="/wishlist" className={styles.link}>Wishlist</FDKLink>
				<FDKLink to="/sections?slug=test" className={styles.link}>Sections</FDKLink>
			</div>
		</nav>
	);
}

export default Header;
