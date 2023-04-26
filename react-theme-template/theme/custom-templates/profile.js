import React from 'react';

function Profile({ fpi }) {
	console.info(!!fpi);
	return (
		<>
			<h1 style={{ color: 'red' }}>This is a custom page for Profile in flow</h1>
			<hr />

		</>
	);
}

Profile.serverFetch = ({ router }) => {
	console.log('CUSTOM TEMPLATE IN THEME SERVER FETCGH: ', router);
};

export default Profile;
