// babel.config.js

module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [ // Note the array wrapping the plugin name and its options
        'module:react-native-dotenv',
        {
          moduleName: '@env',      // The name you use to import
          path: '.env',            // The path to your .env file
          safe: false,             // If true, will error if a variable is not defined
          allowUndefined: true,    // If false, will error if a variable is undefined
        },
      ],
    ],
  };
};