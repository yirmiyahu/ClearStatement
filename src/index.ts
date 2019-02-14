import { html, render } from 'lit-html';

interface SupportClaimsMap {
  [_: string]: HTMLElement[];
}

const ATTRIBUTE_CLAIM     = 're';
const ATTRIBUTE_CONTAINER = 'ctn';
const ATTRIBUTE_SUPPORT   = 'for';

function addSupport(store: SupportClaimsMap, support: HTMLElement): SupportClaimsMap {
  const topic = support.getAttribute(ATTRIBUTE_SUPPORT);
  store[topic] = (store[topic] || []);
  store[topic].push(support);
  return store;
}

function onClaimClickHandler(event: MouseEvent) {
  const clickedEl = event.target as HTMLElement;
  if (!ClearStatement.isClaim(clickedEl)) return;

  if (clickedEl.hasAttribute('href')) {
    window.open(clickedEl.getAttribute('href'));
  } else {
    const clearStatement = clickedEl as ClearStatement;
    clearStatement.toggleExpanded();

    const topic = clearStatement.getAttribute(ATTRIBUTE_CLAIM);
    const supports = this.mappedSupports[topic];
    toggleSupports(supports, clearStatement.expanded);
  }

  event.stopPropagation();
}

function toggleSupports(supports: HTMLElement[], show: boolean) {
  supports.forEach((support) => toggleSupport(support, show));
}

function toggleSupport(support: HTMLElement, show: boolean) {
  if (support instanceof ClearStatement) {
    support.visible = show;
  } else {
    show ? support.setAttribute('visible', '') : support.removeAttribute('visible');
  }
}

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
    <div><slot id="support" name="support"></slot></div>
  `

  static isClaim(el: HTMLElement): boolean {
    return el.hasAttribute(ATTRIBUTE_CLAIM);
  }

  private mappedSupports: SupportClaimsMap;
  private onClaimClick: (event: MouseEvent) => void;

  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: 'open' });
    render(ClearStatement.template(), shadowRoot);
    this.mapSupports();
  }

  mapSupports() {
    const supportsSlot = this.shadowRoot.getElementById('support') as HTMLSlotElement;
    const supportNodes = supportsSlot.assignedNodes();
    this.mappedSupports = supportNodes.length ? supportNodes.reduce(addSupport, {}) : null;
  }

  connectedCallback() {
    if (!this.hasAttribute(ATTRIBUTE_CONTAINER)) return;

    this.onClaimClick = onClaimClickHandler.bind(this);

    this.addEventListener('mouseenter', (_) => {
      this.addEventListener('click', this.onClaimClick);
    });

    this.addEventListener('mouseleave', (_) => {
      this.removeEventListener('click', this.onClaimClick);
    });
  }

  set expanded(value: boolean) {
    value ? this.setAttribute('expanded', '') : this.removeAttribute('expanded');
  }

  get expanded(): boolean {
    return this.hasAttribute('expanded');
  }

  set visible(value: boolean) {
    value ? this.setAttribute('visible', '') : this.removeAttribute('visible');
  }

  get visible(): boolean {
    return this.hasAttribute('visible');
  }

  toggleExpanded() {
    this.expanded = !this.expanded;
  }
}