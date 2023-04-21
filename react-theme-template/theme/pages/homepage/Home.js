import React from 'react';
import { SectionRenderer, useGlobalStore } from 'fdk-core';
import { GETTERS } from 'fdk-store';

function Home({ numberOfSections }) {
	const {
		sections, isLoading, error,
	} = useGlobalStore((store) => store[GETTERS.PAGE_CONFIG]);

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
			<h1>Home page</h1>
			<SectionRenderer sections={sections} />
		</div>
	);
}

// Home.serverFetch = ({ fpi }) => fpi.client.pageConfig.fetchPageConfig('HOME');

export default Home;
