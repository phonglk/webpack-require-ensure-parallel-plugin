
What this plugin does?
======================

![What this plugin does](https://i.imgur.com/FMCdypD.png)

Works with both webpack1 and webpack2 (RC3)

Why we need this ?
=================
You are smart, you use webpack to bundle your application. Your application grow and being complex, you realize that the bundle now is too big and people have to wait for a while, then you turn to code spliting feature of webpack.

Your big application may be an analytics dashboard with different panels or an single page app that have multiple pages which we can split the code to per page. Or any kind of application that have parent-children structure may face this code spliting problem

Let say we have this dependencies graph which if we build into one bundle, it would be 16KB
![Dependencies Graph](https://i.imgur.com/vBqLEVA.png)

Split by per entry
------------------
Because we only show one or two "entries" at a time, loading the whole bundle is unecessary. Instead, we load only 4KB or 8KB initially => better initial load 

[Chunk => modules...]

 1. entry1 => [entry1, dep1]: 4KB
 2. entry2 => [entry2, dep1, dep2, dep3]: 8KB
 3. entry3 => [entry3, dep2, dep3]: 6KB
 4. entry4 => [entry4, dep1]: 4KB
 5. entry5 => [entry5, dep1, dep3]: 6KB

Total (28 KB) 

In trade of, these chunks generate more KBs than single chunk

Split deeper
------------
We notice that entry1 and entry4 can reuse dep1, we go for more advanced code spliting to optimise user experience
Like this 

          require.ensure(['./dep1'], require => {
            require.ensure([], require => {
              resolve(require('./entry1').default)
            }, 'entry1');
          }, 'entry1-required');
          ...
          require.ensure(['./dep1'], require => {
            require.ensure([], require => {
              resolve(require('./entry4').default)
            }, 'entry4');
          }, 'entry4-required');

[Chunk => modules...]

 1. entry1-required => [dep1]: 2
 2. entry2-required => [dep1, dep2, dep3]: 6
 3. entry3-required => [dep2, dep3]: 4
 4. entry4-required => use entry1-required: 0
 5. entry5-required => [dep1, dep3]: 2
 6. entry1 => [entry1]: 2KB
 7. entry2 => [entry2]: 2KB
 8. entry3 => [entry3]: 2KB
 9. entry4 => [entry4]: 2KB
 10. entry5 => [entry5]: 2KB

Total (24KB)

In result, if user already loaded entry1 (with entry1-required loaded), next time user want entry4, he/she does not need to load its depdency again (entry1-required or entry4-required which is optmised removed) and vice versa 
Unfortunately, currently, webpack only support one single depdendency reuse. I believe this will change in the future, I saw it already support Promise.all for multiple chunks, but the parser/compilation still not.
So if you load entry5, you need to load the whole its dependencies, which includes dep1 and dep3. *Why not just dep3 ? we already load dep1 right ?*

Use ensureParallel plugin
-------------------------
 1. entry1-required => [dep1]: 2
 2. entry2-required-1 => [dep2]: 2
 3. entry2-required-3 => [dep3]: 2
 4. entry1 => [entry1]: 2KB
 5. entry2 => [entry2]: 2KB
 6. entry3 => [entry3]: 2KB
 7. entry4 => [entry4]: 2KB
 8. entry5 => [entry5]: 2KB
Total (16KB)

Beside break depdencies into chunks, it also load depdencies in *parallel*. Webpack may have dirty hack to break depdencies into chunk, such as deepening the require.ensure but in that case it won't load in parallel but in linear manner


Know issues:
-------------------------
- Circular/cross depdencies is not handled well, let say dependency of entry5 is entry1: no, you should break common code of entry5 and entry1 into depXX

Examples
=================
Go into the example webpack version and run: npm run start

TODO
=================

[x] Init basic working source

[x] Update Readme

[x] Update example for webpack 1 and 2

[] Add test for webpack 1 and 2

TO IMPROVE
----------
[] Allow multiple chunks naming and auto chunk naming based on file name

[] Optimise block building

[] Research to utilise native multichunk in webpack2

[] Integrate with DLL
