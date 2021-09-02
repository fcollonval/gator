export namespace CondaStore {
    /**
     * Description of the REST API response for each environment
     */
    export interface IEnvironment {
        build_id: number,
        id: number,
        name: string,
        namespace: {
            id: number,
            name: string,
        }
    }

    export async function fetchEnvironments(): Promise<Array<IEnvironment>> {
        const result = await fetch('http://localhost:5000/api/v1/environment/')
        if (result.ok) {
            return await result.json()
        } else {
            return []
        }
    }

    export async function fetchEnvironmentPackages(envNamespace: string, envName: string): Promise<Array<{
        channel_id: number,
        id: number,
        license: string,
        name: string,
        sha256: string,
        version: string,
    }>> {
        const result = await fetch(`http://localhost:5000/api/v1/environment/${envNamespace}/${envName}/`)
        if (result.ok) {
            const {packages} = await result.json()
            return packages
        } else {
            return []
        }
    }
}
