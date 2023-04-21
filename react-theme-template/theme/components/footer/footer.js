import React from 'react';
import styles from './footer.css';

function Footer() {
	return (
		<div className={styles['desktop-footer']}>
			<div className={styles.fyndFeatures}>
				<div className={styles.blocks}>
					<div className={styles['block-item']}>
						<span className={styles['feaure-icon']}>
							<span className={styles['inline-svg']}>
								<img
									alt="some alt"
									src="https://hdn-1.fynd.com/company/884/applications/000000000000000000000001/business-highlights/pictures/square-logo/original/ZRC9TqJlT-business-logo-icon.png"
								/>
							</span>
						</span>
						<span className={styles['feature-data']}>
							<div
								className={`${styles['feature-h1']} ${styles['bold-xl']} ${styles['cl-DarkGrey']}`}
							>
								Everyday Fashion Destination
							</div>
							<div
								className={`${styles['feature-text']} ${styles['regular-xs']} ${styles['cl-DarkGrey']}`}
							>
								{' '}
								Get amazing discounts on Top Brands
								{' '}
							</div>
						</span>
					</div>
					<div className={styles['block-item']}>
						<span className={styles['feaure-icon']}>
							<span className={styles['inline-svg']}>
								<img
									alt="some alt"
									src="https://hdn-1.fynd.com/company/884/applications/000000000000000000000001/business-highlights/pictures/square-logo/original/8XiwtQIHP-business-logo-icon.png"
								/>
							</span>
						</span>
						<span className={styles['feature-data']}>
							<div
								className={`${styles['feature-h1']} ${styles['bold-xl']} ${styles['cl-DarkGrey']}`}
							>
								Superfast Delivery
							</div>
							<div
								className={`${styles['feature-text']} ${styles['regular-xs']} ${styles['cl-DarkGrey']}`}
							>
								{' '}
								We have the industry’s fastest average delivery time.
								{' '}
							</div>
						</span>
					</div>
					<div className={styles['block-item']}>
						<span className={styles['feaure-icon']}>
							<span className={styles['inline-svg']}>
								<img
									alt="some alt"
									src="https://hdn-1.fynd.com/company/884/applications/000000000000000000000001/business-highlights/pictures/square-logo/original/e5NDaBvjO-business-logo-icon.png"
								/>
							</span>
						</span>
						<span className={styles['feature-data']}>
							<div
								className={`${styles['feature-h1']} ${styles['bold-xl']} ${styles['cl-DarkGrey']}`}
							>
								Easy Returns
							</div>
							<div
								className={`${styles['feature-text']} ${styles['regular-xs']} ${styles['cl-DarkGrey']}`}
							>
								{' '}
								Changed your mind? No Worries, we got you covered!
								{' '}
							</div>
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Footer;
