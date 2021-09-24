import React from 'react';
import { Signal } from '@lumino/signaling';
import { UseSignal } from '@jupyterlab/apputils';
import { CondaEnvWidget, ISize } from './CondaEnvWidget'
import { NbCondaStore } from './components/NbCondaStore';

export class CondaStoreEnvWidget extends CondaEnvWidget {
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
                    />
                )}
            </UseSignal>
        );
    }

    // Possibly remove; we aren't using it inside NbCondaStore
    protected _resizeSignal = new Signal<CondaStoreEnvWidget, ISize>(this);
}
