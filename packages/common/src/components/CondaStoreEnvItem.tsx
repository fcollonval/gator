import React from 'react';
import { style } from 'typestyle';
import { GlobalStyle } from './globalStyles';

/**
 * List item representing a conda-store environment.
 *
 * @param {string} environment - Name of the environment
 * @param {string} namespace - Name of the namespace
 * @param {boolean} selected - Whether or not the item is selected
 * @param {function} onClick - Callback for when the item is clicked
 * @param {function} [observe] - useInView observer; usually this is null, unless this is the last
 * element in the list component
 * @return {JSX.Element} Conda-store environment list item
 */
export function CondaStoreEnvItem({
  environment,
  namespace,
  selected,
  onClick,
  observe = null
}: {
  environment: string;
  namespace: string;
  selected?: boolean;
  onClick(environment: string, namespace: string): void;
  observe: (element?: HTMLElement) => void;
}): JSX.Element {
  return (
    <div
      className={selected ? Style.SelectedItem : Style.Item}
      onClick={() => {
        onClick(environment, namespace);
      }}
      ref={observe}
    >
      {`${namespace}/${environment}`}
    </div>
  );
}

namespace Style {
  export const Item = style(GlobalStyle.ListItem, {
    padding: '2px 0 5px 5px',

    $nest: {
      '&:hover': {
        backgroundColor: 'var(--jp-layout-color2)',
        border: '1px solid var(--jp-border-color2)'
      }
    }
  });

  export const SelectedItem = style(GlobalStyle.ListItem, {
    padding: '2px 0 5px 5px',
    backgroundColor: 'var(--jp-brand-color1)',
    color: 'var(--jp-ui-inverse-font-color1)',
    border: '1px solid var(--jp-brand-color1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',

    $nest: {
      '&::after': {
        content: "' '",
        display: 'inline-block',
        padding: '0 5px',
        width: 0,
        height: 0,
        borderTop: 'calc(var(--jp-ui-font-size1) / 2) solid transparent',
        borderBottom: 'calc(var(--jp-ui-font-size1) / 2) solid transparent',
        borderLeft:
          'calc(var(--jp-ui-font-size1) / 2) solid var(--jp-ui-inverse-font-color1)'
      }
    }
  });
}
