import { html, render } from 'lit-html';

interface SupportsMap {
  [_: string]: HTMLElement[];
}

interface ClaimsMap {
  [_: string]: ClearStatement;
}

const COMPONENT_TAG_NAME  = 'clear-statement';
const COMPONENT_NODE_NAME = 'CLEAR-STATEMENT';

const ATTRIBUTE_CLAIM     = 're';
const ATTRIBUTE_CONTAINER = 'ctn';
const ATTRIBUTE_EXPANDED  = 'expanded';
const ATTRIBUTE_SUPPORT   = 'for';
const ATTRIBUTE_VISIBLE   = 'visible';

function addClaim(store: ClaimsMap, el: Node): ClaimsMap {
  if (el.nodeName === COMPONENT_NODE_NAME) {
    const claim = el as ClearStatement;
    const topic = claim.getAttribute(ATTRIBUTE_CLAIM);
    store[topic] = claim;
  }
  return store;
}

function addSupport(store: SupportsMap, support: HTMLElement): SupportsMap {
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
  }

  event.stopPropagation();
}

function displaySupport(support: HTMLElement, show: boolean) {
  if (support instanceof ClearStatement) {
    support.visible = show;
  } else {
    show ? support.setAttribute(ATTRIBUTE_VISIBLE, '') : support.removeAttribute(ATTRIBUTE_VISIBLE);
  }
}

export default class ClearStatement extends HTMLElement {
  static is = COMPONENT_TAG_NAME;

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
    <slot id="claim"></slot>
    <div><slot id="support" name="support"></slot></div>
  `

  static isClaim(el: HTMLElement): boolean {
    return el.hasAttribute(ATTRIBUTE_CLAIM);
  }

  private mappedClaims: ClaimsMap;
  private mappedSupports: SupportsMap;
  private onClaimClick: (event: MouseEvent) => void;

  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: 'open' });
    render(ClearStatement.template(), shadowRoot);
    this.mapClaims();
    this.mapSupports();
  }

  mapClaims() {
    const mainSlot = this.shadowRoot.getElementById('claim') as HTMLSlotElement;
    const nodes = mainSlot.assignedNodes();
    this.mappedClaims = nodes.length ? nodes.reduce(addClaim, {}) : null;
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

  static get observedAttributes(): string[] {
    return [ATTRIBUTE_EXPANDED];
  }

  attributeChangedCallback() {
    const topic = this.getAttribute(ATTRIBUTE_CLAIM);
    const ctn = this.parentElement as ClearStatement;
    ctn.displaySupports(topic, this.hasAttribute(ATTRIBUTE_EXPANDED));
  }

  set expanded(value: boolean) {
    value ? this.setAttribute(ATTRIBUTE_EXPANDED, '') : this.removeAttribute(ATTRIBUTE_EXPANDED);
  }

  get expanded(): boolean {
    return this.hasAttribute(ATTRIBUTE_EXPANDED);
  }

  set visible(value: boolean) {
    value ? this.setAttribute(ATTRIBUTE_VISIBLE, '') : this.removeAttribute(ATTRIBUTE_VISIBLE);
  }

  get visible(): boolean {
    return this.hasAttribute(ATTRIBUTE_VISIBLE);
  }

  toggleExpanded() {
    this.expanded = !this.expanded;
  }

  displaySupports(topic: string, show: boolean) {
    const claim = this.mappedClaims[topic];
    if (claim.expanded !== show) {
      claim.toggleExpanded();
    } else {
      const supports = this.mappedSupports[topic];
      supports.forEach((support) => displaySupport(support, show));
    }
  }

  toggleClaim(topic: string) {
    const claim = this.mappedClaims[topic];
    claim.toggleExpanded();
  }
}