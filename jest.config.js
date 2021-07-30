const moduleOnlyDepdencies = ['periscopic', 'estree-walker', 'is-reference'];

export default {
  preset: 'ts-jest',
  transformIgnorePatterns: [
    `node_modules/(?!(${moduleOnlyDepdencies.join('|')})/)`,
  ],
  moduleNameMapper: moduleOnlyDepdencies.reduce((obj, moduleName) => {
    obj[moduleName] = `<rootDir>/node_modules/${moduleName}/src/index.js`;
    return obj;
  }, {}),
  transform: {
    '^.+\\.ts$': 'ts-jest',
    '^.+\\.js$': 'babel-jest',
  },
};
