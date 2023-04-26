import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/header.less';

function Header() {
	return (
		<nav className={styles.header}>
			<div className={styles['link-menu']}>
				<Link to="/" className={styles.link}>Home</Link>
				<Link to="/products" className={styles.link}>Products</Link>
				<Link to="/brands" className={styles.link}>Brands</Link>
				<Link to="/collections" className={styles.link}>Collections</Link>
				<Link to="/cart" className={styles.link}>Cart</Link>
				<Link to="/wishlist" className={styles.link}>Wishlist</Link>
				<Link to="/sections?slug=test" className={styles.link}>Sections</Link>
			</div>
		</nav>
	);
}

export default Header;
