import React, { useEffect } from 'react';
import { useGlobalStore } from 'fdk-core/utils';

import { ErrorHandler } from '../components/error-handler';

function ProductDescription({
	fpi, slug,
}) {
	const {
		productDetails,
	} = useGlobalStore((store) => store[fpi.getters.PRODUCT_DESCRIPTION_PAGE]);

	const { loading, error, ...product } = productDetails || {};

	useEffect(() => {
		const currentProductExists = product?.slug === slug;
		if (!currentProductExists) {
			fpi.productDescription.fetchProductBySlug({ slug });
		}
	}, [slug]);

	if (!slug) {
		return <h2>product slug not found !</h2>;
	}

	if (loading) {
		return <h1>Product details are being loaded</h1>;
	}

	if (error) {
		return (
			<ErrorHandler error={error} />
		);
	}

	return (
		<>
			<h1>{product.name}</h1>
			<h3>{product.description}</h3>
			{
				product.medias?.map((media) => (
					<img key={media.url} src={media.url} alt={media.alt} width={400} />
				))
			}
			<pre>
				{JSON.stringify(product, 4, 4)}
			</pre>
		</>
	);
}

ProductDescription.serverFetch = ({ fpi, router }) => {
	const slug = router?.params?.slug ?? null;
	const dataPromises = [
		// fpi.pageConfig.fetchPageConfig('PDP'),
	];
	if (slug) {
		dataPromises.push(fpi.productDescription.fetchProductBySlug({ slug }));
	}

	return Promise.all(dataPromises);
};

export default ProductDescription;
