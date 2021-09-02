import React, { useState, useEffect, useCallback } from 'react';
import {
  CondaPkgToolBar,
  PACKAGE_TOOLBAR_HEIGHT,
  PkgFilters
} from './CondaPkgToolBar';
import { Style } from './CondaPkgPanel';
import { CondaStorePkgList } from './CondaStorePkgList';
import {
  fetchPackages,
  fetchEnvironmentPackages,
  ICondaStorePackage
} from '../condaStore';

interface ICondaStorePkgPanelProps {
  height: number;
  width: number;
  namespace: string;
  environment: string;
}

export interface ICondaStorePackageMapEntry {
  versionInstalled: string;
  packages: Array<ICondaStorePackage>;
}

export function CondaStorePkgPanel({
  height,
  width,
  environment,
  namespace
}: ICondaStorePkgPanelProps): JSX.Element {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState(PkgFilters.All);
  const [isLoading, setIsLoading] = useState(false);
  const [selected, setSelected] = useState([]);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [packages, setPackages] = useState(new Map());
  const [nPackages, setNPackages] = useState(0);

  const [packagesPage, setPackagesPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);

  const [installedPackages, setInstalledPackages] = useState([]);
  const [installedPackagesPage, setInstalledPackagesPage] = useState(1);
  const [nInstalledPackages, setNInstalledPackages] = useState(0);
  const [hasMoreInstalledPackages, setHasMoreInstalledPackages] = useState(
    true
  );

  function handleCategoryChanged(
    event: React.ChangeEvent<HTMLSelectElement>
  ): void {
    return;
  }

  function handleSearch() {
    return;
  }

  function handleUpdateAll() {
    return;
  }

  function handleApply() {
    return;
  }

  function handleCancel() {
    return;
  }

  async function handleRefreshPackages() {
    await refreshPackages();
  }

  function handleClick() {
    return;
  }

  function handleVersionSelection() {
    return;
  }

  function handleDependenciesGraph() {
    return;
  }

  const groupPackages = useCallback((pkgs: Array<ICondaStorePackage>): Map<
    string,
    ICondaStorePackageMapEntry
  > => {
    const grouped = new Map();
    pkgs.forEach(pkg => {
      if (grouped.has(pkg.name)) {
        const pkgObj = grouped.get(pkg.name);
        grouped.set(pkg.name, {
          ...pkgObj,
          packages: [...pkgObj.packages, pkg]
        });
      } else {
        grouped.set(pkg.name, {
          versionInstalled: null,
          packages: [pkg]
        });
      }
    });
    return sortByVersion(grouped);
  }, []);

  const getInstalledPackages = useCallback(async (): Promise<
    Array<ICondaStorePackage>
  > => {
    const { count, data, page, size } = await fetchEnvironmentPackages(
      namespace,
      environment,
      installedPackagesPage
    );
    setNInstalledPackages(count);
    setInstalledPackagesPage(installedPackagesPage + 1);
    setHasMoreInstalledPackages(count > page * size);
    return data;
  }, [environment, namespace, installedPackagesPage]);

  const getAvailablePackages = useCallback(async (): Promise<
    Array<ICondaStorePackage>
  > => {
    const { count, data, page, size } = await fetchPackages(packagesPage);
    setNPackages(count);
    setPackagesPage(packagesPage + 1);
    setHasMoreData(count > page * size);
    return data;
  }, [packagesPage]);

  const loadPackages = useCallback(async () => {
    if (hasMoreData && !isLoading) {
      setIsLoading(true);

      // Get new packages, group by name, and then merge with existing packages
      // available packages we've fetched so far
      const newPackages = mergeMaps(
        packages,
        groupPackages(await getAvailablePackages())
      );
      // Get the name of the last available package
      const lastPackage = Array.from(newPackages.keys())[newPackages.size - 1];

      let installedPkgs = installedPackages;
      let lastInstalled =
        installedPkgs.length > 0
          ? installedPkgs[installedPkgs.length - 1].name
          : undefined;

      // If there are more installed packages to fetch, and either
      // 1. No installed packages have been fetched, or
      // 2. The last installed package comes alphabetically before the last available package
      // Then fetch more packages until either we run out or have fetched enough to be further
      // along in the alphabet than we are with the available packages.
      while (
        hasMoreInstalledPackages &&
        (installedPkgs.length === 0 ||
          lastInstalled.localeCompare(lastPackage) < 0)
      ) {
        installedPkgs = [...installedPkgs, ...(await getInstalledPackages())];
        lastInstalled =
          installedPkgs.length > 0
            ? installedPkgs[installedPkgs.length - 1].name
            : undefined;
      }

      // Update the state with the installed packages; then update each package with the
      // installed version, if any
      setInstalledPackages(installedPkgs);
      installedPkgs.forEach(({ name, version }) => {
        if (newPackages.has(name)) {
          newPackages.set(name, {
            ...newPackages.get(name),
            versionInstalled: version
          });
        }
      });
      setPackages(newPackages);
      setIsLoading(false);
    }
  }, [
    packages,
    hasMoreData,
    isLoading,
    groupPackages,
    getAvailablePackages,
    getInstalledPackages,
    hasMoreInstalledPackages,
    installedPackages
  ]);

  function sortByVersion(
    pkgMap: Map<string, ICondaStorePackageMapEntry>
  ): Map<string, ICondaStorePackageMapEntry> {
    const sorted = new Map();
    pkgMap.forEach((pkgObj, name) => {
      sorted.set(name, {
        ...pkgObj,
        packages: pkgObj.packages.sort(
          (element1: ICondaStorePackage, element2: ICondaStorePackage) => {
            return element1.version.localeCompare(element2.version, undefined, {
              numeric: true,
              sensitivity: 'base'
            });
          }
        )
      });
    });
    return sorted;
  }

  function mergeMaps(
    map1: Map<string, ICondaStorePackageMapEntry>,
    map2: Map<string, ICondaStorePackageMapEntry>
  ): Map<string, ICondaStorePackageMapEntry> {
    const merged = new Map(map1);
    map2.forEach((value, key) => {
      if (merged.has(key)) {
        merged.set(key, {
          versionInstalled:
            value.versionInstalled === null
              ? merged.get(key).versionInstalled
              : value.versionInstalled,
          packages: [...merged.get(key).packages, ...value.packages]
        });
      } else {
        merged.set(key, value);
      }
    });
    return merged;
  }

  async function refreshPackages() {
    setPackages(new Map([]));
    setPackagesPage(1);
    setNPackages(0);
    setHasMoreData(true);
  }

  useEffect(() => {
    if (
      environment !== '' &&
      namespace !== '' &&
      nPackages === 0 &&
      hasMoreData &&
      packagesPage === 1 &&
      packages.size === 0
    ) {
      loadPackages();
    }
  }, [
    loadPackages,
    environment,
    namespace,
    nPackages,
    hasMoreData,
    packagesPage,
    packages
  ]);

  return (
    <div className={Style.Panel}>
      <CondaPkgToolBar
        isPending={isLoading}
        category={activeFilter}
        hasSelection={selected.length > 0}
        hasUpdate={hasUpdate}
        searchTerm={searchTerm}
        onCategoryChanged={handleCategoryChanged}
        onSearch={handleSearch}
        onUpdateAll={handleUpdateAll}
        onApply={handleApply}
        onCancel={handleCancel}
        onRefreshPackages={handleRefreshPackages}
      />
      <CondaStorePkgList
        height={height - PACKAGE_TOOLBAR_HEIGHT}
        packages={packages}
        onPkgClick={handleClick}
        onPkgChange={handleVersionSelection}
        onPkgGraph={handleDependenciesGraph}
        onBottomHit={loadPackages}
        isLoading={isLoading}
        nPackages={nPackages}
      />
    </div>
  );
}
