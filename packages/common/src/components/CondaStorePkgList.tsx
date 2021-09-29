import React from 'react';
import { faSquare } from '@fortawesome/free-regular-svg-icons/faSquare';
import { faCheckSquare } from '@fortawesome/free-solid-svg-icons/faCheckSquare';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons/faExternalLinkAlt';
import { faExternalLinkSquareAlt } from '@fortawesome/free-solid-svg-icons/faExternalLinkSquareAlt';
import { faMinusSquare } from '@fortawesome/free-solid-svg-icons/faMinusSquare';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { HTMLSelect } from '@jupyterlab/ui-components';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import useInView from 'react-cool-inview';
import { classes, style } from 'typestyle';
import { NestedCSSProperties } from 'typestyle/lib/types';
import {
  CONDA_PACKAGES_PANEL_ID,
  CONDA_PACKAGE_SELECT_CLASS
} from '../constants';
import { ICondaStorePackage } from '../condaStore';
import { ICondaStorePackageMapEntry } from './CondaStorePkgPanel';

const HEADER_HEIGHT = 29;

interface IPkgListProps {
  height: number;
  packages: Map<string, ICondaStorePackageMapEntry>;
  onPkgClick(pkg: ICondaStorePackage): void;
  onPkgChange(pkg: ICondaStorePackage, version: string): void;
  onPkgGraph(pkg: ICondaStorePackage): void;
  onBottomHit(): Promise<void>;
  isLoading: boolean;
  nPackages: number;
}

function InfiniteListWidget({
  onPkgGraph,
  onPkgChange,
  onPkgClick,
  height,
  width,
  packages,
  observe
}: {
  onPkgGraph: (pkg: ICondaStorePackage) => void;
  onPkgChange: (pkg: ICondaStorePackage, version: string) => void;
  onPkgClick: (pkg: ICondaStorePackage) => void;
  height: number;
  width: number;
  packages: Map<string, ICondaStorePackageMapEntry>;
  observe: (element?: HTMLElement) => void;
}): JSX.Element {
  return (
    <FixedSizeList
      height={Math.max(0, height - HEADER_HEIGHT)}
      overscanCount={3}
      itemCount={packages.size}
      itemData={packages}
      itemKey={(
        index: number,
        data: Map<string, ICondaStorePackageMapEntry>
      ): React.Key => {
        return indexMap(data, index).key;
      }}
      itemSize={40}
      width={width}
    >
      {generateRowRenderer(onPkgGraph, onPkgChange, onPkgClick, observe)}
    </FixedSizeList>
  );
}

function indexMap<K, V>(map: Map<K, V>, index: number): { key: K; value: V } {
  const key = Array.from(map.keys())[index];
  return { key, value: map.get(key) };
}

function generateRowRenderer(
  onPkgGraph: (pkg: ICondaStorePackage) => void,
  onPkgChange: (pkg: ICondaStorePackage, version: string) => void,
  onPkgClick: (pkg: ICondaStorePackage) => void,
  observe: (element?: HTMLElement) => void
) {
  function rowRenderer({
    data,
    index,
    style
  }: ListChildComponentProps): JSX.Element {
    const { value: pkgObj }: { value: ICondaStorePackageMapEntry } = indexMap(
      data,
      index
    );

    // Get the package with the highest version number
    const pkg = pkgObj.packages[pkgObj.packages.length - 1];
    return (
      <div
        className={rowClassName(index, false)}
        style={style}
        onClick={(): void => {
          onPkgClick(pkg);
        }}
        ref={index === data.size - 1 ? observe : null}
        role="row"
      >
        <IconRender
          version_installed={pkgObj.versionInstalled}
          version_selected=""
        />
        <NameRender name={pkg.name} home={pkg.home} />
        <div
          className={classes(Style.CellSummary, Style.DescriptionSize)}
          role="gridcell"
          title={pkg?.summary}
        >
          {pkg?.summary}
        </div>
        <VersionRender versionInstalled={pkgObj.versionInstalled} />
        <div className={classes(Style.Cell, Style.ChangeSize)} role="gridcell">
          <ChangeRender pkg={pkg} onPkgChange={onPkgChange} />
        </div>
        <div
          className={classes(Style.Cell, Style.ChannelSize)}
          role="gridcell"
          title={pkg?.channel}
        >
          {pkg?.channel}
        </div>
      </div>
    );
  }
  return rowRenderer;
}

export function CondaStorePkgList({
  height,
  packages,
  onPkgClick,
  onPkgChange,
  onPkgGraph,
  onBottomHit,
  isLoading,
  nPackages
}: IPkgListProps): JSX.Element {
  const { observe } = useInView({
    rootMargin: '200px 0px',
    onChange: async ({ inView, unobserve, observe }) => {
      if (inView) {
        unobserve();
        await onBottomHit();
        observe();
      }
    }
  });

  return (
    <div id={CONDA_PACKAGES_PANEL_ID} role="grid">
      <AutoSizer disableHeight>
        {({ width }): JSX.Element => {
          return (
            <>
              <div
                className={Style.RowHeader}
                style={{ width: width }}
                role="row"
              >
                <div
                  className={classes(Style.Cell, Style.StatusSize)}
                  role="columnheader"
                ></div>
                <div
                  className={classes(Style.Cell, Style.NameSize)}
                  role="columnheader"
                >
                  Name
                </div>
                <div
                  className={classes(Style.Cell, Style.DescriptionSize)}
                  role="columnheader"
                >
                  Description
                </div>
                <div
                  className={classes(Style.Cell, Style.VersionSize)}
                  role="columnheader"
                >
                  Version
                </div>
                <div
                  className={classes(Style.Cell, Style.ChangeSize)}
                  role="columnheader"
                >
                  Change To
                </div>
                <div
                  className={classes(Style.Cell, Style.ChannelSize)}
                  role="columnheader"
                >
                  Channel
                </div>
              </div>
              <InfiniteListWidget
                onPkgGraph={onPkgGraph}
                onPkgChange={onPkgChange}
                onPkgClick={onPkgClick}
                height={height}
                width={width}
                observe={observe}
                packages={packages}
              />
            </>
          );
        }}
      </AutoSizer>
    </div>
  );
}

function rowClassName(index: number, isSelected: boolean): string {
  if (index >= 0) {
    return index % 2 === 0
      ? Style.RowEven(isSelected)
      : Style.RowOdd(isSelected);
  }
}

function ChangeRender({
  pkg,
  onPkgChange
}: {
  pkg: ICondaStorePackage;
  onPkgChange(pkg: ICondaStorePackage, version: string): void;
}): JSX.Element {
  return (
    <div className={'lm-Widget'}>
      <HTMLSelect
        className={classes(Style.VersionSelection, CONDA_PACKAGE_SELECT_CLASS)}
        value={pkg.version}
        onClick={(evt: React.MouseEvent): void => {
          evt.stopPropagation();
        }}
        onChange={(evt: React.ChangeEvent<HTMLSelectElement>): void =>
          onPkgChange(pkg, evt.target.value)
        }
        aria-label="Package versions"
      >
        <option key="-3" value={'none'}>
          Remove
        </option>
        {
          // {!pkg?.version_installed && (
          //     <option key="-2" value={''}>
          //     Install
          //     </option>
          // )}
          // {pkg?.updatable && (
          //     <option key="-1" value={''}>
          //     Update
          //     </option>
          // )}
          // {pkg?.available_version.map((v) => (
          //     <option key={v} value={v}>
          //     {v}
          //     </option>
          // ))}
        }
      </HTMLSelect>
    </div>
  );
}

function IconRender({
  version_selected,
  version_installed
}: {
  version_installed: string;
  version_selected: string;
}): JSX.Element {
  let icon: JSX.Element;
  if (version_installed) {
    if (version_selected === 'none') {
      icon = (
        <FontAwesomeIcon
          icon={faMinusSquare}
          style={{ color: 'var(--jp-error-color1)' }}
        />
      );
    } else if (version_selected !== version_installed) {
      icon = (
        <FontAwesomeIcon
          icon={faExternalLinkSquareAlt}
          style={{ color: 'var(--jp-accent-color1)' }}
        />
      );
    } else {
      icon = (
        <FontAwesomeIcon
          icon={faCheckSquare}
          style={{ color: 'var(--jp-brand-color1)' }}
        />
      );
    }
  } else if (version_selected !== '') {
    icon = (
      <FontAwesomeIcon
        icon={faCheckSquare}
        style={{ color: 'var(--jp-brand-color1)' }}
      />
    );
  } else {
    icon = (
      <FontAwesomeIcon
        icon={faSquare}
        style={{ color: 'var(--jp-ui-font-color2)' }}
      />
    );
  }

  return (
    <div className={classes(Style.Cell, Style.StatusSize)} role="gridcell">
      {icon}
    </div>
  );
}

function NameRender({
  home,
  name
}: {
  home: string;
  name: string;
}): JSX.Element {
  let content: JSX.Element;
  if (home?.length > 0) {
    content = (
      <a
        className={Style.Link}
        href={home}
        onClick={(evt): void => evt.stopPropagation()}
        target="_blank"
        rel="noopener noreferrer"
      >
        {name} <FontAwesomeIcon icon={faExternalLinkAlt} />
      </a>
    );
  } else {
    content = <span>{name}</span>;
  }

  return (
    <div className={classes(Style.Cell, Style.NameSize)} role="gridcell">
      {content}
    </div>
  );
}

function VersionRender({
  versionInstalled,
  updatable
}: {
  versionInstalled: string;
  updatable?: boolean;
}): JSX.Element {
  return (
    <div className={classes(Style.Cell, Style.VersionSize)} role="gridcell">
      <a
        className={updatable ? Style.Updatable : undefined}
        href="#"
        onClick={(evt): void => {
          evt.stopPropagation();
          // onPkgGraph(pkg)
        }}
        rel="noopener noreferrer"
        title="Show dependency graph"
      >
        {versionInstalled}
      </a>
    </div>
  );
}

namespace Style {
  const row: NestedCSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  };

  export const RowHeader = style(row, {
    color: 'var(--jp-ui-font-color1)',
    fontWeight: 'bold',
    fontSize: 'var(--jp-ui-font-size2)',
    height: HEADER_HEIGHT,
    boxSizing: 'border-box',
    paddingRight: 17 // Take into account the package list scrollbar width
  });

  const rowContent: NestedCSSProperties = {
    fontSize: 'var(--jp-ui-font-size1)',
    color: 'var(--jp-ui-font-color0)',
    lineHeight: 'normal',
    $nest: {
      '&:hover': {
        backgroundColor: 'var(--jp-layout-color3)'
      }
    }
  };

  export const RowEven = (selected: boolean): string =>
    style(row, rowContent, {
      background: selected ? 'var(--jp-brand-color3)' : 'unset'
    });

  export const RowOdd = (selected: boolean): string =>
    style(row, rowContent, {
      background: selected
        ? 'var(--jp-brand-color3)'
        : 'var(--jp-layout-color2)'
    });

  export const Cell = style({
    margin: '0px 2px',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden'
  });

  export const StatusSize = style({ flex: '0 0 12px', padding: '0px 2px' });
  export const NameSize = style({ flex: '1 1 200px' });
  export const DescriptionSize = style({ flex: '5 5 250px' });
  export const VersionSize = style({ flex: '0 0 90px' });
  export const ChangeSize = style({ flex: '0 0 120px' });
  export const ChannelSize = style({ flex: '1 1 120px' });

  export const CellSummary = style({
    margin: '0px 2px',
    alignSelf: 'flex-start',
    whiteSpace: 'normal',
    height: '100%',
    overflow: 'hidden'
  });

  export const SortButton = style({
    transform: 'rotate(180deg)',
    marginLeft: '10px',
    color: 'var(--jp-ui-font-color2)',
    border: 'none',
    backgroundColor: 'var(--jp-layout-color0)',
    fontSize: 'var(--jp-ui-font-size1)'
  });

  export const Link = style({
    $nest: {
      '&:hover': {
        textDecoration: 'underline'
      }
    }
  });

  export const Updatable = style({
    color: 'var(--jp-brand-color0)',

    $nest: {
      '&::before': {
        content: "'↗️'",
        paddingRight: 2
      }
    }
  });

  export const VersionSelection = style({
    width: '100%'
  });
}
