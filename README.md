ethpm.js
========

[![API Documentation](https://img.shields.io/badge/api-documentation-blue.svg)](https://ethpm.github.io/ethpm.js/index.html)
[![Build Status](https://travis-ci.org/ethpm/ethpm.js.svg?branch=master)](https://travis-ci.org/ethpm/ethpm.js)

Work in progress library for interacting with EthPM packages in
Javascript and TypeScript.

Check out a short guided tutorial [here](tutorial/README.md).

## Usage Example

```typescript
const ethpm: Session = await EthPM.configure<HasManifests>({
  manifests: "ethpm/manifests/v2",
}).connect();

const pkg = await ethpm.manifests.read(examples["wallet-with-send"]);
```

See [[Session]] for API

