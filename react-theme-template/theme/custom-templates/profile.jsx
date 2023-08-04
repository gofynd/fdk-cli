import React from 'react';
import { loginGuard } from '../helper/auth-guard';

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
};

export default Profile;
