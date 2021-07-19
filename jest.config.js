export default {
  preset: "ts-jest",
  transformIgnorePatterns: ["node_modules/(?!(periscopic)/)"],
  moduleNameMapper: {
    periscopic: "<rootDir>/node_modules/periscopic/src/index.js",
  },
  transform: {
    "^.+\\.ts$": "ts-jest",
    "^.+\\.js$": "babel-jest",
  },
};
