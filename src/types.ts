// Used in {@link} comment
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { collectLicenses } from './collect';

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
