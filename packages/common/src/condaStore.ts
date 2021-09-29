const baseUrl = 'http://localhost:5000/api/v1';

export interface ICondaStoreEnvironment {
  name: string;
  build_id: number;
  id: number;
  namespace: {
    id: number;
    name: string;
  };
}

export interface ICondaStorePackage {
  name: string;
  version: string;
  channel_id: number;
  id: number;
  license: string;
  sha256: string;

  // Required in the CondaStorePkgList, but not in the API
  summary?: string;
  channel?: string;
  updatable?: boolean;
  home?: string;
  version_installed?: string;
  available_version?: Array<string>;
}

export interface ICondaStoreChannel {
  id: number;
  last_update: string;
  name: string;
}

interface IPaginatedResult<T> {
  count?: number;
  data?: Array<T>;
  page?: number;
  size?: number;
  status?: string;
}

/**
 * Fetch all conda-store environments.
 *
 * @async
 * @return {Promise<IPaginatedResult<ICondaStoreEnvironment>>} All environments visible to conda-store.
 */
export async function fetchEnvironments(
  page = 1,
  size = 100
): Promise<IPaginatedResult<ICondaStoreEnvironment>> {
  const response = await fetch(
    `${baseUrl}/environment/?page=${page}&size=${size}`
  );
  if (response.ok) {
    return await response.json();
  } else {
    return {};
  }
}

/**
 * Search all packages (both installed and not installed) for a package.
 *
 * @async
 * @param {string} term - Search term; both name and descriptions are searched
 * @return {Promise<Array<ICondaStorePackage>>} Packages matching the search term.
 */
export async function searchPackages(
  term: string
): Promise<Array<ICondaStorePackage>> {
  const response = await fetch(`${baseUrl}/package/?search=${term}`);
  if (response.ok) {
    return await response.json();
  } else {
    return [];
  }
}

/**
 * Fetch the packages available in the conda-store database.
 *
 * Results are distinct on name and version.
 * @async
 * @return {Promise<IPaginatedResult<ICondaStorePackage>>} List of available packages
 */
export async function fetchPackages(
  page = 1,
  size = 100
): Promise<IPaginatedResult<ICondaStorePackage>> {
  const response = await fetch(
    `${baseUrl}/package/?page=${page}&size=${size}&distinct_on=name&distinct_on=version`
  );
  if (response.ok) {
    return await response.json();
  } else {
    return {};
  }
}

/**
 * List the installed packages for the given environment and namespace.
 *
 * @async
 * @param {string} namespace - Name of the namespace to be searched
 * @param {string} environment - Name of the environment to be searched
 * @return {Promise<IPaginatedResult<ICondaStorePackage>>} List of packages in the given namespace/environment
 * combination
 */
export async function fetchEnvironmentPackages(
  namespace: string,
  environment: string,
  page = 1,
  size = 100
): Promise<IPaginatedResult<ICondaStorePackage>> {
  if (namespace === undefined || environment === undefined) {
    console.error(
      `Error: invalid arguments to fetchEnvironmentPackages: envNamespace ${namespace} envName ${environment}`
    );
    return {};
  }

  let response = await fetch(
    `${baseUrl}/environment/${namespace}/${environment}/`
  );

  if (response.ok) {
    const { data } = await response.json();
    response = await fetch(
      `${baseUrl}/build/${data.current_build_id}/packages/?page=${page}&size=${size}`
    );
    if (response.ok) {
      return response.json();
    }
  }
  return {};
}

/**
 * List the packages for the given build.
 *
 * @async
 * @param {number} build_id - Build for which the packages are to be listed
 * @return {Promise<IPaginatedResult<ICondaStorePackage>>} List of packages that are part of the
 * given build
 */
export async function fetchBuildPackages(
  build_id: number
): Promise<IPaginatedResult<ICondaStorePackage>> {
  const response = await fetch(`${baseUrl}/build/${build_id}/`);
  if (response.ok) {
    return await response.json();
  }
  return {};
}

/**
 * Fetch the channels. Channels are remote repositories containing conda packages.
 *
 * @async
 * @return {Promise<Array<ICondaStoreChannel>>} List of all possible channels from which packages
 * may be downloaded..
 */
export async function fetchChannels(): Promise<Array<ICondaStoreChannel>> {
  const response = await fetch(`${baseUrl}/channel/`);
  if (response.ok) {
    return await response.json();
  }
  return [];
}
