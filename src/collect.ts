import checker from 'license-checker';
import { exit } from 'process';
import fs from 'fs';
import path from 'path';
import { CachedFetch } from './cached-fetch';

export interface ErrorOnPackage {
  name: string;
  error?: string;
}

/**
 * Object of different options used in {@link collectLicenses}
 */
export interface Options {
  /**
   * Path to folder containing license texts for each package.
   * Useful when a package does not have a `LICENSE` file but instead embeds
   * their license inside their `README.md` file, which wharf-collect-licenses
   * cannot extract from.
   *
   * The file names should be the package name + "@" + the full version.
   *
   * Reasoning for having the version as required is to ensure you reevaluate
   * every time the package  updates, just in case they changed license between
   * the versions.
   */
  licenseOverridesPath?: string;

  /**
   * Path to folder containing package.json and node_modules.
   * @default "." Defaults to the current working directory.
   */
  packageToCheckPath?: string;

  /**
   * Where to output the resulting JSON file.
   * The output is an array of {@link LicensedPackageData}.
   * @default "./licenses.json" Defaults to licenses.json in the current working directory.
   */
  outputFilePath?: string;

  /**
   * List of package name and version for which to exclude from the results.
   *
   * The values should be the package name + "@" + the full version.
   *
   * Reasoning for having the version as required is to ensure you reevaluate
   * every time the package  updates, just in case they changed license between
   * the versions.
   *
   * @example
   * collectLicenses({
   *   excludedPackages: [
   *     '@fortawesome/fontawesome-free@5.15.3', // already contains license notice in stylesheets
   *   ],
   * });
   */
  excludedPackages?: string[];

  /**
   * List of license SPDX IDs for which to exclude from the results.
   *
   * @example
   * collectLicenses({
   *   excludedSPDXLicenses: [
   *     "0BSD", // The 0BSD license requires no attribution.
   *   ],
   * });
   */
  excludedSPDXLicenses?: string[];

  /**
   * List of package names to throw an error and fail on if the package has not
   * been excluded. Useful for erroring out on packages that was not excluded
   * by the {@link excludedPackages} option.
   *
   * @example
   * collectLicenses({
   *   excludedPackages: [
   *     '@fortawesome/fontawesome-free@5.15.3', // already contains license notice in stylesheets
   *   ],
   *   errorOnPackageNames: [
   *     { name: '@fortawesome/fontawesome-free', error: 'not sure version also embeds license in stylesheets' },
   *   ],
   * });
   */
  errorOnPackageNames?: ErrorOnPackage[];
}

export interface LicensedPackageData {
  name: string;
  version: string;
  description?: string;
  repository?: string;
  url?: string;
  licenses: string[];
  licenseText: string;
}

const cachedFetch = new CachedFetch();

export function collectLicenses(opt?: Options) {
  opt = opt ?? {};
  opt.outputFilePath = opt.outputFilePath ? path.resolve(opt.outputFilePath) : path.join(process.cwd(), 'licenses.json');
  opt.packageToCheckPath = opt.packageToCheckPath ? path.resolve(opt.packageToCheckPath) : process.cwd();
  opt.licenseOverridesPath = opt.licenseOverridesPath ? path.resolve(opt.licenseOverridesPath) : null;

  console.log('Checking packages in package:', opt.packageToCheckPath);
  if (opt.licenseOverridesPath) {
    console.log('Using license overrides from:', opt.licenseOverridesPath);
  } else {
    console.log('Using no license overrides.');
  }
  console.log('Excluding packages:', opt.excludedPackages);
  console.log('Excluding licenses:', opt.excludedSPDXLicenses);
  console.log('Error on non-excluded package names:', opt.errorOnPackageNames);
  console.log('Resulting JSON will be written to:', opt.outputFilePath);
  console.log();

  checker.init({
    start: opt.packageToCheckPath,
    production: true,
    customFormat: {
      name: '',
      version: '',
      description: '',
    },
    excludePrivatePackages: true,
    exclude: (opt.excludedSPDXLicenses ?? []).join(',') as any, // the @types/license-checker is wrong, it should be a string
    excludePackages: (opt.excludedPackages ?? []).join(';'),
  }, async (err, packages): Promise<void> => {
    if (err) {
      console.error('Failed to find licenses:', err);
      exit(1);
    }

    const errorOnPackage = new Map((opt.errorOnPackageNames ?? []).map(o => [o.name, o.error ?? "package was declared in errorOnPackageNames option"]));

    const packageErrors = Object.values(packages)
      .filter(p => errorOnPackage.has(p.name))
      .map(p => `${p.name}@${p.version}: ${errorOnPackage.get(p.name)}`);
    if (packageErrors.length > 0) {
      console.error('Errors on some packages:', packageErrors);
      exit(1);
    }

    const pkgArr = await Promise.all(Object.values(packages)
      .map(o => opt.licenseOverridesPath ? overrideLicense(o, opt.licenseOverridesPath) : o)
      .map(replaceReadmeLicenseWithRemoteLicense));

    const unlicensed = pkgArr.filter(p => p.licenses === 'UNLICENSED');
    if (unlicensed.length > 0) {
      console.error(
        'Cannot use unlicensed packages:',
        unlicensed.map(printablePackage));
      exit(1);
    }

    const licensesFromReadme = pkgArr.filter(p => isReadmeFile(p.licenseFile));
    if (licensesFromReadme.length > 0) {
      console.error(
        'Cannot use license texts from README files, as their content is error-prone:',
        licensesFromReadme.map(printablePackage));
      exit(1);
    }

    console.log();
    console.log('Found licenses:');
    console.table(pkgArr.map(printablePackage));
    console.log();

    const jsonContent = JSON.stringify(pkgArr.map(p => ({
      name: p.name,
      version: p.version,
      description: p.description,
      repository: p.repository,
      url: p.url,
      publisher: p.publisher,
      licenses: typeof p.licenses === 'string' ? [p.licenses] : p.licenses,
      licenseText: p.licenseText,
    } as LicensedPackageData)), null, 2);

    fs.writeFileSync(opt.outputFilePath, jsonContent);
    console.log('Written to:', opt.outputFilePath);
  });
}

const printablePackage = (p: checker.ModuleInfo): Record<string, any> => ({
  package: `${p.name}@${p.version}`,
  repo: p.repository,
  licenses: typeof p.licenses === 'string' ? p.licenses : p.licenses.join(', '),
});

const overrideLicense = (p: checker.ModuleInfo, licensesOverrideBasePath: string): checker.ModuleInfo => {
  let licensePath: string;
  try {
    licensePath = fs.realpathSync(`${licensesOverrideBasePath}/${p.name}@${p.version}.txt`);
    fs.accessSync(licensePath, fs.constants.R_OK);
  } catch {
    // No file found, or not readable
    return p;
  }
  const file = fs.readFileSync(licensePath);
  return {
    ...p,
    licenseFile: licensePath,
    licenseText: file.toString(),
  };
};

const readmeRegex = /^README(|\.txt|\.md|\.markdown)$/i;
const isReadmeFile = (filePath: string): boolean => filePath ? readmeRegex.test(path.basename(filePath)) : false;
const licensePossibleFileNames = [
  'LICENSE',
  'LICENSE.md',
  'LICENSE.txt',
];

const replaceReadmeLicenseWithRemoteLicense = async (p: checker.ModuleInfo): Promise<checker.ModuleInfo> => {
  if (!isReadmeFile(p.licenseFile)) {
    return p;
  }
  if (p.repository.startsWith('https://github.com/')) {
    try {
      const urls = licensePossibleFileNames.map(n => `${p.repository}/raw/${p.version}/${n}`);
      const res = await cachedFetch.fetchFirstFiltered(urls, r => r.ok);
      if (!res) {
        console.warn(
          `Failed to fetch remote LICENSE file for ${p.name}@${p.version} due to none of the files gave OK response:`,
          licensePossibleFileNames);
        return p;
      }
      console.log(`Found remote license for ${p.name}@${p.version}:`, res.url);
      return {
        ...p,
        licenseFile: res.url,
        licenseText: res.text,
      };
    } catch (err) {
      console.warn(`Failed to fetch remote LICENSE file for ${p.name}@${p.version} due to error:`, err);
    }
  } else {
    console.warn(`Cannot find remote license for ${p.name}@${p.version} due to unknown repository host:`, p.repository);
  }
  return p;
};
