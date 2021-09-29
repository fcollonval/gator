import React, { useState, useEffect, useCallback } from 'react';
// import { INotification } from 'jupyterlab_toastify'
import { fetchEnvironments } from '../condaStore';
import { Style } from './NbConda';
import { CondaStorePkgPanel } from './CondaStorePkgPanel';
import {
  CondaStoreEnvList,
  ENVIRONMENT_PANEL_WIDTH
} from './CondaStoreEnvList';

/**
 * Conda-store environment management component.
 *
 * @param {number} height - Height of the widget
 * @param {number} width - Width of the widget
 * @return {JSX.Element}
 */
export function NbCondaStore({
  height,
  width
}: {
  height: number;
  width: number;
}): JSX.Element {
  const [isLoading, setIsLoading] = useState(false);
  const [activeEnvironment, setActiveEnvironment] = useState('');
  const [activeNamespace, setActiveNamespace] = useState('');

  // Environments contains namespace info; see ICondaStoreEnvironment
  const [environments, setEnvironments] = useState([]);
  const [environmentPage, setEnvironmentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);

  /**
   * Load the next page of environments.
   *
   * @async
   * @return {Promise<void>}
   */
  const loadEnvironments = useCallback(async () => {
    if (hasMoreData && !isLoading) {
      setIsLoading(true);
      const { count, data, page, size } = await fetchEnvironments(
        environmentPage
      );
      setEnvironments([...environments, ...data]);
      setEnvironmentPage(environmentPage + 1);
      setHasMoreData(count > page * size);
      setIsLoading(false);
    }
  }, [hasMoreData, isLoading, environments, environmentPage]);

  /**
   * Change the active environment and namespace.
   *
   * @async
   * @param {string} environment - Newly selected environment name
   * @param {string} namespace - Newly selected namespace name
   * @return {Promise<void>}
   */
  async function environmentChange(
    environment: string,
    namespace: string
  ): Promise<void> {
    setActiveEnvironment(environment);
    setActiveNamespace(namespace);
  }

  async function createEnvironment() {
    return;
  }

  async function cloneEnvironment() {
    return;
  }

  async function importEnvironment() {
    return;
  }

  async function exportEnvironment() {
    return;
  }

  /**
   * Clear the current set of environments.
   *
   * @async
   * @return {Promise<void>}
   */
  async function clearEnvironments() {
    setActiveEnvironment('');
    setActiveNamespace('');
    setEnvironments([]);
    setEnvironmentPage(1);
    setHasMoreData(true);
  }

  async function removeEnvironment() {
    return;
  }

  // Whenever the list of environments is empty, load a new page of environments.
  useEffect(() => {
    if (environments.length === 0 && hasMoreData && environmentPage === 1) {
      loadEnvironments();
    }
  }, [loadEnvironments, environments, hasMoreData, environmentPage]);

  return (
    <div className={Style.Panel}>
      <CondaStoreEnvList
        height={height}
        isLoading={isLoading}
        environments={environments}
        selected={activeEnvironment}
        onSelectedChange={environmentChange}
        onCreate={createEnvironment}
        onClone={cloneEnvironment}
        onImport={importEnvironment}
        onExport={exportEnvironment}
        onRefresh={clearEnvironments}
        onRemove={removeEnvironment}
        onBottomHit={loadEnvironments}
      />
      <CondaStorePkgPanel
        height={height}
        width={width - ENVIRONMENT_PANEL_WIDTH}
        namespace={activeNamespace}
        environment={activeEnvironment}
      />
    </div>
  );
}
