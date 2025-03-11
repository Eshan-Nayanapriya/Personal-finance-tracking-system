export default {
  transform: {
    "^.+\\.js$": "babel-jest",
  },
  testEnvironment: "node",
  moduleNameMapper: {
    // Map local controllers correctly, adjust for your folder structure
    "^@controllers/(.+)\\.js$": "<rootDir>/src/controllers/$1.js",
    // Other necessary mappings can go here
  },
  moduleDirectories: [
    "node_modules",
    "<rootDir>/src", // Ensure Jest can resolve your local modules in src
  ],
};
