# wharf-collect-licenses

Collects licenses from `node_modules` and GitHub and outputs license texts and
metadata in JSON format.

Extends [`license-checker`](https://github.com/davglass/license-checker) with
better filtering, validation, and fetching licenses from GitHub.com if the
license text is missing from the `node_modules` folder.

## NPM package

Found here: <https://npmjs.com/package/@iver-wharf/wharf-collect-licenses>

## Usage

1. First install:

   ```console
   $ npm install --save-dev @iver-wharf/wharf-collect-licenses
   ```

2. Then write a simple JavaScript file to use it:

   ```js
   // collect-licenses.js

   const { collectLicenses } = require('@iver-wharf/wharf-collect-licenses');

   collectLicenses({
     outputFilePath: 'src/assets/licenses.json',
     licenseOverridesPath: 'deploy/collect-licenses/licenses_override',

     excludedSPDXLicenses: [
       '0BSD', // The 0BSD license requires no attribution.
     ],

     excludedPackages: [
       '@fortawesome/fontawesome-free@5.15.3', // already contains license notice in stylesheets
     ],

     errorOnPackageNames: [
       { name: '@fortawesome/fontawesome-free', error: 'not sure version also embeds license in stylesheets' },
     ],
   });
   ```

3. Then run it via Node:

   ```console
   $ node collect-licenses.js

   Checking packages in package: /home/me/code/wharf/wharf-web
   Using license overrides from: /home/me/code/wharf/wharf-web/deploy/collect-licenses/licenses_override
   Excluding packages: [ '@fortawesome/fontawesome-free@5.15.3' ]
   Excluding licenses: [ '0BSD' ]
   Error on non-excluded package names: [
     {
       name: '@fortawesome/fontawesome-free',
       error: 'not sure version also embeds license in stylesheets'
     }
   ]
   Resulting JSON will be written to: /home/me/code/wharf/wharf-web/src/assets/licenses.json

   Found remote license for @angular/common@12.1.1: https://raw.githubusercontent.com/angular/angular/12.1.1/LICENSE
   Found remote license for @angular/compiler@12.1.1: https://raw.githubusercontent.com/angular/angular/12.1.1/LICENSE
   Found remote license for @angular/core@12.1.1: https://raw.githubusercontent.com/angular/angular/12.1.1/LICENSE
   Found remote license for @angular/forms@12.1.1: https://raw.githubusercontent.com/angular/angular/12.1.1/LICENSE
   Found remote license for @angular/platform-browser-dynamic@12.1.1: https://raw.githubusercontent.com/angular/angular/12.1.1/LICENSE
   Found remote license for @angular/platform-browser@12.1.1: https://raw.githubusercontent.com/angular/angular/12.1.1/LICENSE
   Found remote license for @angular/router@12.1.1: https://raw.githubusercontent.com/angular/angular/12.1.1/LICENSE
   Found remote license for @angular/animations@12.1.1: https://raw.githubusercontent.com/angular/angular/12.1.1/LICENSE
   Found remote license for primeng@12.0.0: https://raw.githubusercontent.com/primefaces/primeng/12.0.0/LICENSE.md

   Found licenses:
   ┌─────────┬────────────────────────────────────────────┬────────────────────────────────────────────┬──────────────┐
   │ (index) │                  package                   │                    repo                    │   licenses   │
   ├─────────┼────────────────────────────────────────────┼────────────────────────────────────────────┼──────────────┤
   │    0    │        '@angular/animations@12.1.1'        │    'https://github.com/angular/angular'    │    'MIT'     │
   │    1    │           '@angular/cdk@12.1.1'            │  'https://github.com/angular/components'   │    'MIT'     │
   │    2    │          '@angular/common@12.1.1'          │    'https://github.com/angular/angular'    │    'MIT'     │
   │    3    │         '@angular/compiler@12.1.1'         │    'https://github.com/angular/angular'    │    'MIT'     │
   │    4    │           '@angular/core@12.1.1'           │    'https://github.com/angular/angular'    │    'MIT'     │
   │    5    │          '@angular/forms@12.1.1'           │    'https://github.com/angular/angular'    │    'MIT'     │
   │    6    │ '@angular/platform-browser-dynamic@12.1.1' │    'https://github.com/angular/angular'    │    'MIT'     │
   │    7    │     '@angular/platform-browser@12.1.1'     │    'https://github.com/angular/angular'    │    'MIT'     │
   │    8    │          '@angular/router@12.1.1'          │    'https://github.com/angular/angular'    │    'MIT'     │
   │    9    │          'ng-event-source@1.0.14'          │ 'https://github.com/sguiheux/EventSource'  │    'MIT'     │
   │   10    │               'parse5@5.1.1'               │    'https://github.com/inikulin/parse5'    │    'MIT'     │
   │   11    │             'primeicons@4.1.0'             │ 'https://github.com/primefaces/primeicons' │    'MIT'     │
   │   12    │              'primeng@12.0.0'              │  'https://github.com/primefaces/primeng'   │    'MIT'     │
   │   13    │              'prismjs@1.24.1'              │     'https://github.com/PrismJS/prism'     │    'MIT'     │
   │   14    │                'rxjs@7.2.0'                │    'https://github.com/reactivex/rxjs'     │ 'Apache-2.0' │
   │   15    │              'zone.js@0.11.4'              │    'https://github.com/angular/angular'    │    'MIT'     │
   └─────────┴────────────────────────────────────────────┴────────────────────────────────────────────┴──────────────┘

   Written to: /home/me/code/wharf/wharf-web/src/assets/licenses.json
   ```

The resulting JSON file contains the following format:

```json
[
  {
    "name": "string",
    "version": "string",
    "description": "string or undefined",
    "repository": "string or undefined",
    "url": "string or undefined",
    "licenses": [ "string" ],
    "licenseText": "string"
  }
]
```

---

Maintained by [Iver](https://www.iver.com/en).
Licensed under the [MIT license](./LICENSE).
