import {Conda} from '../src/tokens'

const baseUrl = 'http://localhost:5000/api/v1'

export namespace CondaStore {
    /**
     * Description of the REST API response for each environment
     */
    export interface IEnvironment extends Conda.IEnvironment {
        build_id: number,
        id: number,
        name: string,
        namespace: {
            id: number,
            name: string,
        }
    }

    export interface IPackage {
        channel_id: number,
        id: number,
        license: string,
        name: string,
        sha256: string,
        version: string,

    }

    export async function fetchEnvironments(): Promise<Array<IEnvironment>> {
        const response = await fetch(`${baseUrl}/environment/`)
        if (response.ok) {
            return await response.json()
        } else {
            return []
        }
    }

    export async function fetchEnvironmentPackages(envNamespace: string, envName: string): Promise<Array<IPackage>> {
        const response = await fetch(`${baseUrl}/environment/${envNamespace}/${envName}/`)
        if (response.ok) {
            const {packages} = await response.json()
            return packages
        } else {
            return []
        }
    }

    export async function getChannels(): Promise<Conda.IChannels> {
        const response = await fetch(`${baseUrl}/channel/`)
        if (response.ok) {
            const channels = await response.json()

            // Reformat the channels into the form expected for NbCondaStore
            const data: Conda.IChannels = {}
            channels.forEach(({name}: {name: string}) => {
                data[name] = [name]
            });
            return data
        }
        return {}
    }
}
