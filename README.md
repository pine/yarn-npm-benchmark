`yarn` & `npm` Benchmark
------------------------

Benchmark for Node package managers

## Requirements

- Node v7 ~
- ndenv
- yarn

## Getting Started

### 1. Install target Node.js versions
See also `index.js`.

```
$ ndenv install 4.6.2
$ ndenv install 6.9.1
$ NDENV_VERSION=6.9.1 ndenv exec npm install -g yarn
```

### 2. Collect `package.json` files
See [package-json-collector](https://github.com/pine/package-json-collector).

- yarn-npm-benchmark
  - packages <--- The directory for collected package.json files
    - owner\_repo <--- GitHub repository owner & name
      - package.json
    - owner2\_repo2
      - package.json
    - ...
  - package.json
  - index.js
  - result.csv <--- The generated result

### 3. Run benchmark

```
$ yarn
$ yarn start
```

### 4. See `result.csv`

## FAQ
### Are the npm or yarn caches effective ?
All caches are disabled.

```
# clean global cache
$ npm cache clean
$ yarn cache clean

# clean local cache
$ rm -rf node_modules
$ rm -rf yarn.lock
$ rm -rf npm-shrinkwrap.json
```

### What npm or yarn cli options are attached ?
It is enabled an only `--ignore-scripts` option.

## License
Public Domain
