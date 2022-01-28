# Wharf collect-licenses library changelog

This project tries to follow [SemVer 2.0.0](https://semver.org/).

<!--
	When composing new changes to this list, try to follow convention.

	The WIP release shall be updated just before adding the Git tag.
	From (WIP) to (YYYY-MM-DD), ex: (2021-02-09) for 9th of February, 2021

	A good source on conventions can be found here:
	https://changelog.md/
-->

## v2.0.0 (WIP)

- BREAKING: Changed package to ES module to stay compatible with node-fetch.
  This drops support for usage by CommonJS modules. (#6)

  If importing this package in a script file, a quick fix is to rename the file
  from `myscript.js` to `myscript.mjs`, and then run `node myscript.mjs`.

## v1.0.1 (2022-01-25)

- Security: Changed version of node-fetch from 2.6.5 to 3.2.0 for
  [CVE-2022-0235](https://nvd.nist.gov/vuln/detail/CVE-2022-0235). (#3)

## v1.0.0 (2021-11-05)

- Initial release. (#2)
