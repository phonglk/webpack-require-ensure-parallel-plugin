# webpack-require-ensure-parallel-plugin
require.ensure but in parallel manner (experimental)

require.ensureParallel: Custom function to replace require.ensure (can be both existing)

Instead of bundling all dependencies in require.ensure into one chunk, do separate them to each own chunks.

Benefits:
- Utilise HTTP2 Parallel Connection
- Utilise build efficient and size
- Open oportunity for progressive booting to improve ux

* Intent to work with both webpack1 and webpack2

TODO:

[] Init basic working source

[] Update Readme

[] Update example for webpack 1 and 2

[] Add test for webpack 1 and 2

TO IMPROVE:

[] Optimise block building

[] Research to utilise native multichunk in webpack2

[] Integrate with DLL
