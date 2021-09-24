import React from 'react'
import { style } from 'typestyle'
import { CONDA_ENVIRONMENT_PANEL_ID } from '../constants'
import { ICondaStoreEnvironment } from '../condaStore'
import { CondaStoreEnvItem } from './CondaStoreEnvItem'
import { CondaEnvToolBar, ENVIRONMENT_TOOLBAR_HEIGHT } from './CondaEnvToolBar'
import useInView from 'react-cool-inview'

export const ENVIRONMENT_PANEL_WIDTH = 250;

interface ICondaStoreEnvListProps {
    height: number
    isLoading: boolean
    environments: Array<ICondaStoreEnvironment>
    selected: string
    onSelectedChange(environment: string, namespace: string): void
    onCreate(): void
    onClone(): void
    onImport(): void
    onExport(): void
    onRefresh(): void
    onRemove(): void
    onBottomHit(): Promise<void>
}

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
    onBottomHit,
}: ICondaStoreEnvListProps): JSX.Element {
    const { observe } = useInView({
        onChange: async ({ inView, unobserve, observe }) => {
            if (inView) {
                unobserve()
                await onBottomHit()
                observe()
            }
        }
    })

    // Forbid clone and removing the environment named "base" (base conda environment)
    // and the default one (i.e. the one containing JupyterLab)
    const isDefault = selected === 'base'
    const listItems = environments.map((env, index) => {
        return (
            <CondaStoreEnvItem
                environment={env.name}
                namespace={env.namespace.name}
                key={`${env.namespace.name}/${env.name}`}
                selected={selected ? env.name === selected : false}
                onClick={onSelectedChange}
                observe={index === environments.length-1 ? observe: null}
            />
        )
    })

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
                className={Style.ListEnvs(
                    height - ENVIRONMENT_TOOLBAR_HEIGHT - 32
                )}
            >
                {listItems}
            </div>
        </div>
    )
}

namespace Style {
    export const Panel = style({
        flexGrow: 0,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        width: ENVIRONMENT_PANEL_WIDTH
    })

    export const ListEnvs = (height: number): string => style({
        height: height,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column'
    })
}
