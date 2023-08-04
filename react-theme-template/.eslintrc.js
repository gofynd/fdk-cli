module.exports = {
	env: {
		browser: true,
		es2021: true,
		node: true,
	},
	extends: [
		'plugin:react/recommended',
		'airbnb',
	],
	overrides: [
	],
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
	},
	plugins: [
		'react',
	],
	rules: {
		'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
		'react/prop-types': 'off',
		'no-new-func': 'off',
		'no-restricted-syntax': 'off',
		'no-console': 'off',
		'no-await-in-loop': 'off',
		'import/prefer-default-export': 'off',
		indent: [2, 'tab', { SwitchCase: 1, VariableDeclarator: 1 }],
		'no-tabs': 0,
		'react/jsx-indent': [2, 'tab'],
		'react/jsx-no-bind': 'off',
		'react/button-has-type': 'off',
		'react/jsx-indent-props': [2, 'tab'],
		'react/jsx-props-no-spreading': 'off',
		'import/no-unresolved': 'off',
	},
};
