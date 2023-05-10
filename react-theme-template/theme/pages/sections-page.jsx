import React from 'react';
import { SectionRenderer } from 'fdk-core/components';
import { useGlobalStore } from 'fdk-core/utils';

function Home({ numberOfSections, fpi }) {
	const {
		sections, isLoading, error,
	} = 	useGlobalStore((store) => store[fpi.getters.PAGE_CONFIG]);

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

Home.serverFetch = () => {
};

export default Home;
