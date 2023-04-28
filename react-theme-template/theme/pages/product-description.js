import React, { useEffect } from 'react';
import { SectionRenderer } from 'fdk-core/components';
import { useGlobalStore } from 'fdk-core/utils';

import testImage from '../assets/images/test.png';
import { ErrorHandler } from '../components/error-handler';

function ProductDescription({
	fpi, slug,
}) {
	const {
		isLoading,
		error,
		...product
	} = useGlobalStore((store) => store[fpi.getters.PRODUCT_DESCRIPTION_PAGE]);
	const { sections } = useGlobalStore((store) => store[fpi.getters.PAGE_CONFIG]);

	useEffect(() => {
		const currentProductExists = product?.slug === slug;
		if (!currentProductExists) {
			fpi.productDescription.fetchProductBySlug({ slug });
		}
	}, [slug]);

	if (!slug) {
		return <h2>product slug not found !</h2>;
	}

	if (isLoading) {
		return <h1>Product details are being loaded</h1>;
	}

	if (error) {
		return (
			<ErrorHandler error={error} />
		);
	}

	return (
		<>
			<h1>This should only be updated in local engine</h1>
			<img src={testImage} alt="alt sample" />
			<h1>{product.name}</h1>
			<h3>{product.description}</h3>
			{
				product.medias?.map((media) => (
					<img key={media.url} src={media.url} alt={media.alt} width={400} />
				))
			}
			<SectionRenderer sections={sections} />

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
		dataPromises.push(fpi.productDescription.fetchProductBySlug(slug));
	}

	return Promise.all(dataPromises);
};

export default ProductDescription;
