import React from 'react';
import { ReactWidget, UseSignal } from '@jupyterlab/apputils'
import { Widget } from '@lumino/widgets';
import { Signal } from '@lumino/signaling'
import { NbCondaStore } from './components/NbCondaStore'

interface ISize {
    height: number
    width: number
}

export class CondaStoreEnvWidget extends ReactWidget {
    constructor(condaStoreUrl: string) {
        super()
        this.condaStoreUrl = condaStoreUrl
    }

    protected onResize(msg: Widget.ResizeMessage): void {
        const { height, width } = msg;
        this._resizeSignal.emit({ height, width });
        super.onResize(msg);
    }

    render(): JSX.Element {
        return (
            <UseSignal
                signal={this._resizeSignal}
                initialArgs={{ height: 0, width: 0 }}
            >
                {(_, size): JSX.Element => (
                    <NbCondaStore
                        height={size.height}
                        width={size.width}
                        condaStoreUrl={this.condaStoreUrl}
                    />
                )}
            </UseSignal>
        );
    }

    // Possibly remove; we aren't using it inside NbCondaStore
    protected _resizeSignal = new Signal<CondaStoreEnvWidget, ISize>(this);
    protected condaStoreUrl: string
}
