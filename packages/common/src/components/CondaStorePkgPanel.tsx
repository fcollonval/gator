import React from 'react'
import semver from 'semver';
import {
  CondaPkgToolBar,
  PACKAGE_TOOLBAR_HEIGHT,
  PkgFilters
} from './CondaPkgToolBar';
import {IPkgPanelProps, IPkgPanelState, Style, PANEL_SMALL_WIDTH} from './CondaPkgPanel'
import { INotification } from 'jupyterlab_toastify';
import { Conda } from '../tokens';
import { CondaPkgList } from './CondaPkgList';
import { CondaStore } from '../condaStore'

export interface ICondaStorePkgPanelProps {
    height: number
    width: number
}

export interface ICondaStorePkgPanelState extends IPkgPanelState {
    activeEnvironment: string
    activeNamespace: string
}

export class CondaStorePkgPanel extends React.Component<
    ICondaStorePkgPanelProps,
    ICondaStorePkgPanelState
> {
    constructor(props: IPkgPanelProps) {
        super(props)
        this.state = {
            isLoading: false,
            isApplyingChanges: false,
            hasDescription: false,
            hasUpdate: false,
            packages: [],
            selected: [],
            searchTerm: '',
            activeFilter: PkgFilters.All,
            activeEnvironment: '',
            activeNamespace: '',
        }

        this.handleCategoryChanged = this.handleCategoryChanged.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleVersionSelection = this.handleVersionSelection.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleUpdateAll = this.handleUpdateAll.bind(this);
        this.handleApply = this.handleApply.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.handleRefreshPackages = this.handleRefreshPackages.bind(this);
    }

    handleCategoryChanged(): void {
        return
    }
    handleClick(): void {
        return
    }
    handleVersionSelection(): void {
        return
    }
    handleSearch(): void {
        return
    }
    handleUpdateAll(): void {
        return
    }
    handleApply(): void {
        return
    }
    handleCancel(): void {
        return
    }
    handleRefreshPackages(): void {
        return
    }
    handleDependenciesGraph(): void {
        return
    }

    async updatePackages(): Promise<void> {
        this.setState({
            isLoading: true,
            hasUpdate: false,
            packages: [],
            selected: []
        });

        try {
            const environmentLoading = this.state.activeEnvironment
            const namespaceLoading = this.state.activeNamespace

            const packages = await CondaStore.fetchEnvironmentPackages(
                namespaceLoading,
                environmentLoading
            )
            this.setState({
                packages
            })
            const availablePackages = this.condaPackageManager.refresh(true, environmentLoading)

            let hasUpdate = false
            availablePackages.forEach((pkg: Conda.IPackage, index: number) => {
                try {
                    if (
                        pkg.version_installed &&
                        semver.gt(
                            semver.coerce(pkg.version[pkg.version.length - 1]),
                            semver.coerce(pkg.version_installed)
                        )
                    ) {
                        availablePackages[index].updatable = true;
                        hasUpdate = true;
                    }
                } catch(error) {
                    console.debug(`Error when testing updatable status for ${pkg.name}`, error)
                }
            })
            this.setState({
                isLoading: false,
                hasDescription: this.condaPackageManager.hasDescription(),
                packages: availablePackages,
                hasUpdate
            });
        } catch (error) {
            if (error.message !== 'cancelled') {
                this.setState({
                    isLoading: false
                });
                console.error(error);
                INotification.error(error.message);
            }
        }
    }


    componentDidUpdate(_prevProps: IPkgPanelProps): void {
        if (this._currentEnvironment !== this.props.packageManager.environment) {
            this._currentEnvironment = this.props.packageManager.environment;
            this._updatePackages();
        }
    }

    render(): JSX.Element {
        let filteredPkgs: Conda.IPackage[] = [];
        if (this.state.activeFilter === PkgFilters.All) {
            filteredPkgs = this.state.packages;
        } else if (this.state.activeFilter === PkgFilters.Installed) {
            filteredPkgs = this.state.packages.filter(pkg => pkg.version_installed);
        } else if (this.state.activeFilter === PkgFilters.Available) {
            filteredPkgs = this.state.packages.filter(pkg => !pkg.version_installed);
        } else if (this.state.activeFilter === PkgFilters.Updatable) {
            filteredPkgs = this.state.packages.filter(pkg => pkg.updatable);
        } else if (this.state.activeFilter === PkgFilters.Selected) {
            filteredPkgs = this.state.packages.filter(
                pkg => this.state.selected.indexOf(pkg) >= 0
            );
        }

        let searchPkgs: Conda.IPackage[] = [];
        if (this.state.searchTerm === null) {
            searchPkgs = filteredPkgs;
        } else {
            searchPkgs = filteredPkgs.filter(pkg => {
                const lowerSearch = this.state.searchTerm.toLowerCase();
                return (
                    pkg.name.indexOf(this.state.searchTerm) >= 0 ||
                    (this.state.hasDescription &&
                        (pkg.summary.indexOf(this.state.searchTerm) >= 0 ||
                            pkg.keywords.indexOf(lowerSearch) >= 0 ||
                            pkg.tags.indexOf(lowerSearch) >= 0))
                );
            });
        }

        return (
            <div className={Style.Panel}>
                <CondaPkgToolBar
                    isPending={this.state.isLoading}
                    category={this.state.activeFilter}
                    hasSelection={this.state.selected.length > 0}
                    hasUpdate={this.state.hasUpdate}
                    searchTerm={this.state.searchTerm}
                    onCategoryChanged={this.handleCategoryChanged}
                    onSearch={this.handleSearch}
                    onUpdateAll={this.handleUpdateAll}
                    onApply={this.handleApply}
                    onCancel={this.handleCancel}
                    onRefreshPackages={this.handleRefreshPackages}
                />
                <CondaPkgList
                    height={this.props.height - PACKAGE_TOOLBAR_HEIGHT}
                    hasDescription={
                        this.state.hasDescription && this.props.width > PANEL_SMALL_WIDTH
                    }
                    packages={searchPkgs}
                    onPkgClick={this.handleClick}
                    onPkgChange={this.handleVersionSelection}
                    onPkgGraph={this.handleDependenciesGraph}
                />
            </div>
        );
    }
}
