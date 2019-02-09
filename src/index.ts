// interface SupportClaimsMap {
//   [_: string]: HTMLElement;
// }

// const ATTRIBUTE_SUPPORT = 'for';

export default class ClearStatement extends HTMLElement {
  static is = 'clear-statement';
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