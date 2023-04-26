import React from 'react';

export function ErrorHandler({ error }) {
	console.log('Error in error component : ', error);
	const { name, message, stack } = error;

	if (name === 'FDKServerResponseError') {
		return (
			<>
				<h1>
					{message}
				</h1>
				<pre>
					{stack}
				</pre>
			</>
		);
	}
	return (
		<>
			<h1>Some Error Occured</h1>
			<pre>{JSON.stringify(error)}</pre>
		</>
	);
}
