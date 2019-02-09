// interface SupportClaimsMap {
//   [_: string]: HTMLElement;
// }

// const ATTRIBUTE_SUPPORT = 'for';

import { html, render } from 'lit-html';

export default class ClearStatement extends HTMLElement {
  static is = 'clear-statement';

  static template = (object: string) => html`
    <p>Hello, ${object}</p>
  `

  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: 'open' });
    render(ClearStatement.template('World'), shadowRoot);
  }

  // private supportClaimsMap: SupportClaimsMap;

  // constructor() {
  //   super();
  //   const shadowRoot = this.attachShadow({ mode: 'open' });
  //   const template = document.getElementById('clear-statement') as HTMLTemplateElement;
  //   shadowRoot.appendChild(template.content.cloneNode(true));
  //   this.supportClaimsMap = this.mapSupports();
  // }

  // mapSupports(): SupportClaimsMap {
  //   const supportsSlot = this.shadowRoot.getElementById('support') as HTMLSlotElement;
  //   const supportNodes = supportsSlot.assignedNodes();

  //   if (!supportNodes.length) {
  //     return;
  //   }

  //   return Array.prototype.reduce.call(supportNodes, (store: SupportClaimsMap, support: HTMLElement) => {
  //     store[support.getAttribute(ATTRIBUTE_SUPPORT)] = support;
  //     return store;
  //   }, {});
  // }
}