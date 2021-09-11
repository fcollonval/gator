import React from 'react'
import {
  CondaPkgToolBar,
  PACKAGE_TOOLBAR_HEIGHT,
  PkgFilters
} from './CondaPkgToolBar';
import {IPkgPanelProps, IPkgPanelState, Style, PANEL_SMALL_WIDTH} from './CondaPkgPanel'
import { Conda } from '../tokens';
import { CondaPkgList } from './CondaPkgList';

export class CondaStorePkgPanel extends React.Component<IPkgPanelProps, IPkgPanelState> {
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
            activeFilter: PkgFilters.All
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
