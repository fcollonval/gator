import React, {useState, useEffect, useCallback} from 'react'
// import { INotification } from 'jupyterlab_toastify'
import { fetchEnvironments } from '../condaStore'
import { Style } from './NbConda'
import { CondaStorePkgPanel } from './CondaStorePkgPanel'
import { CondaStoreEnvList, ENVIRONMENT_PANEL_WIDTH } from './CondaStoreEnvList';

export interface INbCondaStoreProps {
    height: number
    width: number
    condaStoreUrl: string
}

export function NbCondaStore({
    height,
    width,
    condaStoreUrl,
}: INbCondaStoreProps): JSX.Element {

    const [isLoading, setIsLoading] = useState(false)
    const [activeEnvironment, setActiveEnvironment] = useState('')
    const [activeNamespace, setActiveNamespace] = useState('')

    // Environments contains namespace info; see ICondaStoreEnvironment
    const [environments, setEnvironments] = useState([])
    const [environmentPage, setEnvironmentPage] = useState(1)
    const [hasMoreData, setHasMoreData] = useState(true)

    /**
     * Load the environments; more requests are made when the user scrolls down.
     */
    const loadEnvironments = useCallback(async () => {
        if (hasMoreData && !isLoading) {
            setIsLoading(true)
            const {count, data, page, size} = await fetchEnvironments(
                condaStoreUrl,
                environmentPage,
            )
            setEnvironments([...environments, ...data])
            setEnvironmentPage(environmentPage+1)
            setHasMoreData(count > page*size)
            setIsLoading(false)
        }
    }, [hasMoreData, isLoading, environments, environmentPage, condaStoreUrl])

    async function environmentChange(environment: string, namespace: string): Promise<void> {
        setActiveEnvironment(environment)
        setActiveNamespace(namespace)
    }

    async function createEnvironment() {
        return
    }

    async function cloneEnvironment() {
        return
    }

    async function importEnvironment() {
        return
    }

    async function exportEnvironment() {
        return
    }

    async function refreshEnvironments() {
        setActiveEnvironment('')
        setActiveNamespace('')
        setEnvironments([])
        setEnvironmentPage(1)
        setHasMoreData(true)
    }

    async function removeEnvironment() {
        return
    }

    useEffect(() => {
        if (
            environments.length === 0
            && hasMoreData
            && environmentPage === 1
        ) {
            loadEnvironments()
        }
    }, [loadEnvironments, environments, hasMoreData, environmentPage])

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
                onRefresh={refreshEnvironments}
                onRemove={removeEnvironment}
                onBottomHit={loadEnvironments}
            />
            <CondaStorePkgPanel
                height={height}
                width={width - ENVIRONMENT_PANEL_WIDTH}
                namespace={activeNamespace}
                environment={activeEnvironment}
                condaStoreUrl={condaStoreUrl}
            />
        </div>
    )
}
