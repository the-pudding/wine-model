module.exports = {
  root: true, // https://eslint.org/docs/user-guide/configuring#using-configuration-files-1
  extends: ['wesbos'],
  rules: {
    'no-plusplus': 0,

    'prettier/prettier': [
      'error',
      {
        arrowParens: 'avoid',
      },
    ],
  },
};
