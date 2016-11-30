`yarn` & `npm` Benchmark
------------------------

Benchmark for Node package managers

## Requirements

- Node.js
- ndenv
- yarn

## Getting Started

### 1. Install target Node.js versions

```
$ ndenv install 4.6.2
$ ndenv install 6.9.1
$ NDENV_VERSION=6.9.1 ndenv exec npm install -g yarn
```

### 2. Collect `package.json` files
See [package-json-collector](https://github.com/pine/package-json-collector).

- .
  - packages <--- directory for collected package.json files
    - owner\_repo <--- GitHub repository owner & name
      - package.json
    - owner2\_repo2
      - package.json
    - ...

### 3. Run benchmark

```
$ yarn
$ yarn start
```

### 4. See `result.csv`

## License
Public Domain
