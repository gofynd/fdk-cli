import React, { useEffect, useState } from 'react';
import { useGlobalStore } from 'fdk-core/utils';
import { Helmet } from 'react-helmet-async';
import { InfinteScroll } from '../components/infinite-scroll';
import ProductGallery from '../components/product-gallery';
import styles from '../styles/product-listing.less';

function ProductListing({ fpi }) {
	const {
		product_lists: productLists,
	} = useGlobalStore((store) => store[fpi.getters.PRODUCTS]);
	const {
		loading, items = [], page,
	} = productLists || {};

	const [params, setParams] = useState({ pageId: page?.next_id ?? '*' });

	const productLoader = () => {
		const hasNext = page?.has_next ?? null;
		const nextPageId = page?.next_id;
		if (hasNext && params.pageId !== nextPageId) {
			setParams({
				...params,
				pageId: nextPageId,
			});
		}
	};

	useEffect(() => {
		// fetch from sdk and populate store
		fpi.products.fetchProductListing(params);
	}, [params]);

	return (
		<div className={styles.container}>
			<Helmet>
				<meta charSet="utf-8" />
				<title>Products</title>
				<meta name="description" content="Meta description from theme here" />
				<link rel="canonical" href="http://mysite.com/example" />
			</Helmet>
			<div className={styles.left}>
				<p className={styles.red_text}>I am filter section</p>
				<TestSideComponent />
			</div>
			<div className={styles.right}>
				<InfinteScroll
					loader={productLoader}
				>
					<p className={styles.itemCount}>
						Total Products:
						{' '}
						{page?.item_total}
					</p>
					<ProductGallery
						products={items}
					/>
					{
						!!loading && <h1>Loading ...</h1>
					}
				</InfinteScroll>
			</div>
		</div>
	);
}

ProductListing.serverFetch = async ({ fpi }) => {
	const products = await fpi.products.fetchProductListing({ pageId: '*' });
	console.log('Products in server : ', products);
};

export default ProductListing;

function TestSideComponent() {
	return <h2>Filters here</h2>;
}
