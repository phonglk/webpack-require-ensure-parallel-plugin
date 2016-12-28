export default function load(entry) {
  return new Promise((resolve) => {
    switch (entry) {
      case 'entry1': {
        require.ensure(['./shared-entry'], require => {
          require.ensure([], require => {
            resolve(require('./entry1').default)
          }, 'entry1');
        }, 'shared-entry');
        break;
      }
      case 'entry2': {
        require.ensureParallel(['./shared-entry', './shared-entry2', './shared-entry3'], require => {
          require.ensure([], require => {
            resolve(require('./entry2').default)
          }, 'entry2');
        }, 'entry2-required');
        break;
      }
      default: resolve(null)
    }
  })
}