import { html, render } from 'lit-html';

interface SupportClaimsMap {
  [_: string]: HTMLElement;
}

const ATTRIBUTE_CLAIM     = 're';
const ATTRIBUTE_CONTAINER = 'ctn';
const ATTRIBUTE_SUPPORT   = 'for';

export default class ClearStatement extends HTMLElement {
  static is = 'clear-statement';

  static template = () => html`
    <style>
      :host([ctn]) {
        display: block;
      }

      :host {
        display: inline-block;
      }

      ::slotted([slot="support"]:not([visible])) {
        display: none;
      }

      ::slotted([slot="support"][visible]) {
        display: block;
      }
    </style>
    <slot></slot>
    <div>
      <slot id="support" name="support"></slot>
    </div>
  `

  static isClaim(el: HTMLElement): boolean {
    return el.hasAttribute(ATTRIBUTE_CLAIM);
  }

  private indexedSupports: SupportClaimsMap;
  private onClaimClick: (event: MouseEvent) => void;
  private _expanded: boolean;
  private _visible: boolean;

  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: 'open' });
    render(ClearStatement.template(), shadowRoot);
    this.indexedSupports = this.indexSupports();
  }

  indexSupports(): SupportClaimsMap {
    const supportsSlot = this.shadowRoot.getElementById('support') as HTMLSlotElement;
    const supportNodes = supportsSlot.assignedNodes();

    if (!supportNodes.length) return;

    return Array.prototype.reduce.call(supportNodes, (store: SupportClaimsMap, support: HTMLElement) => {
      store[support.getAttribute(ATTRIBUTE_SUPPORT)] = support;
      return store;
    }, {});
  }

  connectedCallback() {
    if (!this.hasAttribute(ATTRIBUTE_CONTAINER)) return;

    this.onClaimClick = this.onClaimClickHandler.bind(this);

    this.addEventListener('mouseenter', (_) => {
      this.addEventListener('click', this.onClaimClick);
    });

    this.addEventListener('mouseleave', (_) => {
      this.removeEventListener('click', this.onClaimClick);
    });
  }

  set expanded(value: boolean) {
    value ? this.setAttribute('expanded', '') : this.removeAttribute('expanded');
    this._expanded = value;
  }

  get expanded(): boolean {
    return this._expanded;
  }

  set visible(value: boolean) {
    value ? this.setAttribute('visible', '') : this.removeAttribute('visible');
    this._visible = value;
  }

  get visible(): boolean {
    return this._visible;
  }

  onClaimClickHandler(event: MouseEvent) {
    const clickedEl = event.target as HTMLElement;
    if (!ClearStatement.isClaim(clickedEl)) return;

    if (clickedEl.hasAttribute('href')) {
      window.open(clickedEl.getAttribute('href'));
    } else {
      const clearStatement = clickedEl as ClearStatement;
      clearStatement.expanded = !clearStatement.expanded;

      const support = this.indexedSupports[clearStatement.getAttribute(ATTRIBUTE_CLAIM)];
      if (support instanceof ClearStatement) {
        support.visible = clearStatement.expanded;
      } else {
        if (clearStatement.expanded) {
          support.setAttribute('visible', '');
        } else {
          support.removeAttribute('visible');
        }
      }
    }

    event.stopPropagation();
  }
}