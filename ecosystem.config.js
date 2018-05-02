module.exports = {
	apps: [
		{
			name: 'API',
			script: './app/index.js',
			ignore_watch: ['logs'],
			env: {},
			env_production: {},
		},
	],
};
