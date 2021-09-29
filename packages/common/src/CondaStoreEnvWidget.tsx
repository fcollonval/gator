import React from 'react';
import { Signal } from '@lumino/signaling';
import { UseSignal } from '@jupyterlab/apputils';
import { CondaEnvWidget, ISize } from './CondaEnvWidget';
import { NbCondaStore } from './components/NbCondaStore';

/**
 * Widget which wraps the conda-store environment widgets, emitting resize signals.
 * @extends CondaEnvWidget
 */
export class CondaStoreEnvWidget extends CondaEnvWidget {
  render(): JSX.Element {
    return (
      <UseSignal
        signal={this._resizeSignal}
        initialArgs={{ height: 0, width: 0 }}
      >
        {(_, size): JSX.Element => (
          <NbCondaStore height={size.height} width={size.width} />
        )}
      </UseSignal>
    );
  }

  protected _resizeSignal = new Signal<CondaStoreEnvWidget, ISize>(this);
}
