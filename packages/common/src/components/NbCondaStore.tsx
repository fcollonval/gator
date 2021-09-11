import React from 'react'
// import { Dialog, showDialog } from '@jupyterlab/apputils';
// import { Widget } from '@lumino/widgets';
import { INotification } from 'jupyterlab_toastify'
import { CondaStore } from '..'
import { NbConda, Style } from './NbConda'
import { CondaPkgPanel } from './CondaPkgPanel';
import { CondaEnvList, ENVIRONMENT_PANEL_WIDTH } from './CondaEnvList';

// function createNewEnvironmentDialog(environmentTypes: Array<string>): {
//     body: HTMLElement,
//     typeInput: HTMLSelectElement,
//     nameInput: HTMLInputElement,
// } {
//     const body = document.createElement('div');
//     const nameLabel = document.createElement('label');
//     nameLabel.textContent = 'Name : ';
//     const nameInput = document.createElement('input');
//     body.appendChild(nameLabel);
//     body.appendChild(nameInput);

//     const typeLabel = document.createElement('label');
//     typeLabel.textContent = 'Type : ';
//     const typeInput = document.createElement('select');
//     for (const type of environmentTypes) {
//         const option = document.createElement('option');
//         option.setAttribute('value', type);
//         option.innerText = type;
//         typeInput.appendChild(option);
//     }
//     body.appendChild(typeLabel);
//     body.appendChild(typeInput);
//     return {body, typeInput, nameInput}
// }

export class NbCondaStore extends NbConda {
    async loadEnvironments(): Promise<void> {
        if (!this.state.isLoading) {
            this.setState({isLoading: true})
            try {
                const environments = await CondaStore.fetchEnvironments()
                this.setState({...this.state, isLoading: false, environments})
            } catch (error) {
                if (error !== 'cancelled') {
                    console.error(error)
                    INotification.error(error.message)
                    this.setState({isLoading: false})
                }
            }
        }
    }

    async handleEnvironmentChange(name: string): Promise<void> {
        this.setState({
            currentEnvironment: name,
            channels: await CondaStore.getChannels()
        })
    }

    async handleCreateEnvironment(): Promise<void> {

        // const {body, typeInput, nameInput} = createNewEnvironmentDialog(this.props.model.environmentTypes)
        // const response = await showDialog({
        //     title: 'New Environment',
        //     body: new Widget({ node: body }),
        //     buttons: [Dialog.cancelButton(), Dialog.okButton()]
        // });
        return
    }

    async handleCloneEnvironment(): Promise<void> {
        return
    }
    async handleImportEnvironment(): Promise<void> {
        return
    }
    async handleExportEnvironment(): Promise<void> {
        return
    }
    async handleRefreshEnvironment(): Promise<void> {
        await this.loadEnvironments()
    }
    async handleRemoveEnvironment(): Promise<void> {
        return
    }

    render(): JSX.Element {
        return (
            <div className={Style.Panel}>
                <CondaEnvList
                    height={this.props.height}
                    isPending={this.state.isLoading}
                    environments={this.state.environments}
                    selected={this.state.currentEnvironment}
                    onSelectedChange={this.handleEnvironmentChange}
                    onCreate={this.handleCreateEnvironment}
                    onClone={this.handleCloneEnvironment}
                    onImport={this.handleImportEnvironment}
                    onExport={this.handleExportEnvironment}
                    onRefresh={this.handleRefreshEnvironment}
                    onRemove={this.handleRemoveEnvironment}
                />
                <CondaPkgPanel
                    height={this.props.height}
                    width={this.props.width - ENVIRONMENT_PANEL_WIDTH}
                    packageManager={this.props.model.getPackageManager(
                        this.state.currentEnvironment
                    )}
                />
            </div>
        )
    }
}
