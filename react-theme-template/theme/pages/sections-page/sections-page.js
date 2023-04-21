import React, { useEffect } from 'react';
import { SectionRenderer, useGlobalStore } from 'fdk-core';
import { GETTERS } from 'fdk-store';

function Home({ numberOfSections, fpi }) {
	const { sections, isLoading, error } = useGlobalStore((store) => store[GETTERS.PAGE_CONFIG]);

	useEffect(() => {
		if (!sections?.length) {
			fpi.client.pageConfig.fetchPageConfig(numberOfSections);
		}
	}, [numberOfSections]);

	if (isLoading) {
		return (
			<h2>
				Loading
				{numberOfSections}
				{' '}
				sections
			</h2>
		);
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

	return (
		<div className="wrapper">
			<SectionRenderer sections={sections} />
		</div>
	);
}

Home.serverFetch = ({ router, fpi }) => {
	const numberOfSections = router?.filterQuery?.sections;
	return fpi.client.pageConfig.fetchPageConfig(numberOfSections);
};

export default Home;
