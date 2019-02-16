import { html, render } from 'lit-html';

interface SupportsMap {
  [_: string]: HTMLElement[];
}

interface ClaimsMap {
  [_: string]: ClearStatement;
}

const ATTRIBUTE_CLAIM     = 're';
const ATTRIBUTE_CONTAINER = 'ctn';
const ATTRIBUTE_EXPANDED  = 'expanded';
const ATTRIBUTE_SUPPORT   = 'for';
const ATTRIBUTE_VISIBLE   = 'visible';

const COMPONENT_TAG_NAME  = 'clear-statement';
const COMPONENT_NODE_NAME = 'CLEAR-STATEMENT';

const ID_SLOT             = 'slot';

function addClaim(store: ClaimsMap, claim: ClearStatement) {
  const topic = claim.getAttribute(ATTRIBUTE_CLAIM);
  store[topic] = claim;
}

function addSupport(store: SupportsMap, support: HTMLElement) {
  const topic = support.getAttribute(ATTRIBUTE_SUPPORT);
  store[topic] = (store[topic] || []);
  store[topic].push(support);
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
      :host([${ATTRIBUTE_CONTAINER}]) {
        display: block;
      }

      :host {
        display: inline-block;
      }

      ::slotted([${ATTRIBUTE_SUPPORT}]:not([${ATTRIBUTE_VISIBLE}])) {
        display: none;
      }

      ::slotted([${ATTRIBUTE_SUPPORT}][${ATTRIBUTE_VISIBLE}]) {
        display: block;
      }
    </style>
    <slot id="${ID_SLOT}"></slot>
  `

  static isClaim(el: HTMLElement): boolean {
    return el instanceof HTMLElement && el.nodeName === COMPONENT_NODE_NAME && el.hasAttribute(ATTRIBUTE_CLAIM);
  }

  static isSupport(el: HTMLElement): boolean {
    return el instanceof HTMLElement && el.hasAttribute(ATTRIBUTE_SUPPORT);
  }

  private mappedClaims: ClaimsMap;
  private mappedSupports: SupportsMap;
  private onClaimClick: (event: MouseEvent) => void;
  private onCtnEnter: (event: MouseEvent) => void;
  private onCtnLeave: (event: MouseEvent) => void;
  private onSlotChange: (event: Event) => void;
  private slotEl: HTMLSlotElement;

  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: 'open' });
    render(ClearStatement.template(), shadowRoot);
    this.slotEl = shadowRoot.getElementById(ID_SLOT) as HTMLSlotElement;
  }

  map() {
    const nodes = this.slotEl.assignedNodes();
    const claims = {} as ClaimsMap, supports = {} as SupportsMap;
    nodes.forEach((node) => {
      if (!(node instanceof HTMLElement)) return;
      if (ClearStatement.isClaim(node)) addClaim(claims, node as ClearStatement);
      if (ClearStatement.isSupport(node)) addSupport(supports, node);
    });
    this.mappedClaims = claims, this.mappedSupports = supports;
  }

  connectedCallback() {
    if (!this.hasAttribute(ATTRIBUTE_CONTAINER)) return;

    this.map();
    this.onSlotChange = () => this.map();
    this.slotEl.addEventListener('slotchange', this.onSlotChange);

    this.onClaimClick = onClaimClickHandler;
    this.onCtnEnter = () => this.addEventListener('click', this.onClaimClick);
    this.onCtnLeave = () => this.removeEventListener('click', this.onClaimClick);

    this.addEventListener('mouseenter', this.onCtnEnter);
    this.addEventListener('mouseleave', this.onCtnLeave);
  }

  disconnectedCallback() {
    if (!this.hasAttribute(ATTRIBUTE_CONTAINER)) return;
    this.removeEventListener('mouseenter', this.onCtnEnter);
    this.removeEventListener('mouseleave', this.onCtnLeave);
    this.slotEl.removeEventListener('slotchange', this.onSlotChange);
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