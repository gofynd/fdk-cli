import React, { useEffect, useState } from 'react';
import { useGlobalStore } from 'fdk-core/utils';
import { InfinteScroll } from '../components/infinite-scroll';
import ProductGallery from '../components/product-gallery';
import styles from '../styles/product-listing.less';

function ProductListing({ fpi }) {
	const {
		product_lists: productLists,
	} = useGlobalStore((store) => store[fpi.getters.PRODUCTS]);
	const {
		loading, error, items = [], page,
	} = productLists || {};

	const [params, setParams] = useState({ pageId: page?.next_id ?? '*' });

	const productLoader = () => {
		const hasNext = page?.has_next ?? null;
		const nextPageId = page.next_id;
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
				<InfinteScroll
					loader={productLoader}
				>
					{
						!items?.length
							? (<h1>Products are being loaded !!!</h1>)
							: (
								<ProductGallery
									products={items}
								/>
							)
					}
					{
						!!loading && <h1>Loading ...</h1>
					}
				</InfinteScroll>
			</div>
		</div>
	);
}

ProductListing.serverFetch = ({ fpi }) => fpi.products.fetchProductListing({});

export default ProductListing;

function TestSideComponent() {
	return <h2>Filters here</h2>;
}
