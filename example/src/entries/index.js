export default function load(entry) {
  return new Promise((resolve) => {
    switch (entry) {
      case 'entry1': {
        require.ensure(['./dep1'], require => {
          require.ensure([], require => {
            resolve(require('./entry1').default)
          }, 'entry1');
        }, 'dep1');
        break;
      }
      case 'entry2': {
        require.ensureParallel(['./dep1', './dep2', './dep3'], require => {
          require.ensure([], require => {
            resolve(require('./entry2').default)
          }, 'entry2');
        }, 'entry2-required');
        break;
      }
      case 'entry3': {
        require.ensureParallel(['./dep2', './dep3'], require => {
          require.ensure([], require => {
            resolve(require('./entry3').default)
          }, 'entry3');
        }, 'entry3-required');
        break;
      }
      case 'entry4': {
        require.ensure([], require => {
          resolve(require('./entry4').default)
        }, 'entry4');
        break;
      }
      case 'entry5': {
        require.ensureParallel(['./dep1', './dep3'], require => {
          require.ensure([], require => {
            resolve(require('./entry5').default)
          }, 'entry5');
        }, 'entry5-required');
        break;
      }
      default: resolve(null)
    }
  })
}