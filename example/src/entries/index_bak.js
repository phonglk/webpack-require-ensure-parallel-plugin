// function loadDeps(deps) {
//   function _loadOne(dep) {
//     return new Promise((resolve, reject) => {
//       require.ensure([], require => )
//     })
//   }
// }
export default function load(entry) {
  return new Promise((resolve) => {
    // require.ensure([], require => {
    //   resolve(require('./' + entry).default);
    // });
    switch (entry) {
      case 'entry1': {
        require.ensure(['./shared-entry'], require => {
          require.ensure([], require => {
            resolve(require('./entry1').default)
          }, 'entry1');
        }, 'shared-entry');
        // require.ensure(['./shared-entry'], require => {
        //   resolve(require('./entry1').default);
        // }, 'entry1');
        break;
      }
      case 'entry2': {
        // Promise.all([
        //   new Promise(resolve => require.ensure(['./shared-entry'], require => resolve(), 'shared-entry')),
        //   new Promise(resolve => require.ensure(['./shared-entry2'], require => resolve(), 'shared-entry2')),
        // ]).then(() => {
        //   require.ensure([], require => {
        //     resolve(require('./entry2').default)
        //   }, 'entry2');
        // })
        // require.ensure(['./shared-entry', './shared-entry2'], require => {
        //   require.ensure([], require => {
        //     resolve(require('./entry2').default)
        //   }, 'entry2');
        // }, 'entry2-required');
        require.ensureParallel(['./shared-entry', './shared-entry2'], require => {
          require.ensure([], require => {
            resolve(require('./entry2').default)
          }, 'entry2');
        }, 'entry2-required');
        break;
      }
      // case 'entry3': {
      //   require.ensure([], require => resolve(require('./entry3').default), 'entry3');
      //   break;
      // }
      // case 'entry4': {
      //   require.ensure([], require => resolve(require('./entry4').default), 'entry4');
      //   break;
      // }
      // case 'entry5': {
      //   require.ensure([], require => resolve(require('./entry5').default), 'entry5');
      //   break;
      // }
      default: resolve(null)
    }
  })
}