import React from 'react';

function Cart({ fpi }) {
	console.info(!!fpi);
	return (
		<>
			<h1 style={{ color: 'red' }}>This is a custom page for Cart in flow</h1>
			<hr />

		</>
	);
}

Cart.serverFetch = ({ router }) => {
	console.log('CUSTOM TEMPLATE IN THEME SERVER FETCH: ', router);
};

export default Cart;
