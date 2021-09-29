import React from 'react';
import { style } from 'typestyle';
import { CONDA_ENVIRONMENT_PANEL_ID } from '../constants';
import { ICondaStoreEnvironment } from '../condaStore';
import { CondaStoreEnvItem } from './CondaStoreEnvItem';
import { CondaEnvToolBar, ENVIRONMENT_TOOLBAR_HEIGHT } from './CondaEnvToolBar';
import useInView from 'react-cool-inview';

export const ENVIRONMENT_PANEL_WIDTH = 250;

/**
 * List component for showing conda-store environments.
 *
 * @param {number} height - Height of the component
 * @param {boolean} isLoading - True if the parent widget is loading data, false otherwise
 * @param {Array<ICondaStoreEnvironment>} environments - List of environments to display
 * @param {string} selected - Name of the currently selected environment
 * @param {function} onSelectedChange - Callback which is triggered when an environment is selected
 * @param {function} onCreate - Callback triggered when the create button is clicked
 * @param {function} onClone - Callback triggered when the clone button is clicked
 * @param {function} onImport - Callback triggered when the import button is clicked
 * @param {function} onExport - Callback triggered when the export button is clicked
 * @param {function} onRefresh - Callback triggered when the refresh button is clicked; should
 * refresh the packages
 * @param {function} onRemove - Callback triggered when the remove button is clicked
 * @param {function} onBottomHit - Callback triggered when the user scrolls to the bottom of the
 * environment list; this function should load the next page of environments to display
 * @return {JSX.Element} Component containing a list of conda-store environments
 */
export function CondaStoreEnvList({
  height,
  isLoading,
  environments,
  selected,
  onSelectedChange,
  onCreate,
  onClone,
  onImport,
  onExport,
  onRefresh,
  onRemove,
  onBottomHit
}: {
  height: number;
  isLoading: boolean;
  environments: Array<ICondaStoreEnvironment>;
  selected: string;
  onSelectedChange(environment: string, namespace: string): void;
  onCreate(): void;
  onClone(): void;
  onImport(): void;
  onExport(): void;
  onRefresh(): void;
  onRemove(): void;
  onBottomHit(): Promise<void>;
}): JSX.Element {
  const { observe } = useInView({
    onChange: async ({ inView, unobserve, observe }) => {
      if (inView) {
        unobserve();
        await onBottomHit();
        observe();
      }
    }
  });

  // Forbid clone and removing the environment named "base" (base conda environment)
  // and the default one (i.e. the one containing JupyterLab)
  const isDefault = selected === 'base';
  const listItems = environments.map((env, index) => {
    return (
      <CondaStoreEnvItem
        environment={env.name}
        namespace={env.namespace.name}
        key={`${env.namespace.name}/${env.name}`}
        selected={selected ? env.name === selected : false}
        onClick={onSelectedChange}
        observe={index === environments.length - 1 ? observe : null}
      />
    );
  });

  return (
    <div className={Style.Panel}>
      <CondaEnvToolBar
        isBase={isDefault}
        isPending={isLoading}
        onCreate={onCreate}
        onClone={onClone}
        onImport={onImport}
        onExport={onExport}
        onRefresh={onRefresh}
        onRemove={onRemove}
      />
      <div
        id={CONDA_ENVIRONMENT_PANEL_ID}
        className={Style.ListEnvs(height - ENVIRONMENT_TOOLBAR_HEIGHT - 32)}
      >
        {listItems}
      </div>
    </div>
  );
}

namespace Style {
  export const Panel = style({
    flexGrow: 0,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    width: ENVIRONMENT_PANEL_WIDTH
  });

  export const ListEnvs = (height: number): string =>
    style({
      height: height,
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column'
    });
}
