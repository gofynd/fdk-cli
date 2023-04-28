import React, { useEffect } from 'react';
import { useGlobalStore } from 'fdk-core/utils';
import ProductGallery from '../components/product-gallery';
import styles from '../styles/product-listing.less';

function ProductListing({ fpi }) {
	const {
		productLists,
	} = useGlobalStore((store) => store[fpi.getters.PRODUCT_LISTING_PAGE]);

	const { loading, error, items = [] } = productLists || {};

	useEffect(() => {
		if ((!items?.length)) {
			// fetch from sdk and populate store
			fpi.productListing.fetchProducts({});
		}
	}, []);

	if (loading) {
		return <h1>Product details are being loaded</h1>;
	}

	if (error) {
		return (
			<>
				<h1>Error Occured !</h1>
				<pre>
					{JSON.stringify(error, null, 4)}
				</pre>
			</>
		);
	}

	if (!items?.length) {
		return <h1>No products found !!</h1>;
	}
	return (
		<div className={styles.container}>
			<div className={styles.filterSection}>
				<p className={styles.red_text}>I am filter section</p>
				<TestSideComponent />
			</div>
			<div className={styles.listingSection}>
				{
					!items?.length ? (<h1>Products are being loaded !!!</h1>) : (
						<ProductGallery
							products={items}
						/>
					)
				}
			</div>
		</div>
	);
}

ProductListing.serverFetch = ({ fpi }) => fpi.productListing.fetchProducts({});

export default ProductListing;

function TestSideComponent() {
	return <h2>Filters here</h2>;
}
