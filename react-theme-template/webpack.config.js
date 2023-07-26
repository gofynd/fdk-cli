module.exports = {
	module: {
		rules: [
			{
				test: /\.less$/i,
				use: [
					// compiles Less to CSS
					'less-loader',
				],
			},
			{
				test: /\.svg$/,
				use: ['@svgr/webpack'],
			},
		],
	},
};
