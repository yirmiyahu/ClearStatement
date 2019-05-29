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

function onClaimClick(event: Event) {
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

const KEY_CODE_ENTER = 13;

function onClaimKeydown(event: KeyboardEvent) {
  if (event.keyCode === KEY_CODE_ENTER) onClaimClick(event);
}

function displaySupport(support: HTMLElement, show: boolean) {
  if (support instanceof ClearStatement) {
    support.visible = show;
  } else {
    show ? support.setAttribute(ATTRIBUTE_VISIBLE, '') : support.removeAttribute(ATTRIBUTE_VISIBLE);
  }
}

const styleSheet = new CSSStyleSheet();
styleSheet.replaceSync(`
  :host([${ATTRIBUTE_CONTAINER}]) {
    display: block;
  }

  :host([${ATTRIBUTE_CLAIM}]) {
    cursor: pointer;
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
`.replace(/\n|\s\s+/g, ''));

export default class ClearStatement extends HTMLElement {
  static is = COMPONENT_TAG_NAME;

  static isClaim(el: HTMLElement): boolean {
    return el instanceof HTMLElement && el.nodeName === COMPONENT_NODE_NAME && el.hasAttribute(ATTRIBUTE_CLAIM);
  }

  static isSupport(el: HTMLElement): boolean {
    return el instanceof HTMLElement && el.hasAttribute(ATTRIBUTE_SUPPORT);
  }

  private mappedClaims:   ClaimsMap;
  private mappedSupports: SupportsMap;
  private onBlur:         (event: Event) => void;
  private onCtnEnter:     (event: MouseEvent) => void;
  private onCtnLeave:     (event: MouseEvent) => void;
  private onFocus:        (event: Event) => void;
  private onSlotChange:   (event: Event) => void;
  private slotEl:         HTMLSlotElement;

  constructor() {
    super();
    this.slotEl = document.createElement('slot') as HTMLSlotElement;
    this.slotEl.id = ID_SLOT;
    const shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.adoptedStyleSheets = [ styleSheet ];
    shadowRoot.appendChild(this.slotEl);
  }

  mapStatements() {
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
    if (this.hasAttribute(ATTRIBUTE_CLAIM)) {
      this.tabIndex = 0;
      this.onFocus = () => this.addEventListener('keydown', onClaimKeydown);
      this.addEventListener('focus', this.onFocus);

      this.onBlur = () => this.removeEventListener('keydown', onClaimKeydown);
      this.addEventListener('blur', this.onBlur);
    } else if (this.hasAttribute(ATTRIBUTE_CONTAINER)) {
      this.mapStatements();
      this.onSlotChange = () => this.mapStatements();
      this.slotEl.addEventListener('slotchange', this.onSlotChange);

      this.onCtnEnter = () => this.addEventListener('click', onClaimClick);
      this.addEventListener('mouseenter', this.onCtnEnter);

      this.onCtnLeave = () => this.removeEventListener('click', onClaimClick);
      this.addEventListener('mouseleave', this.onCtnLeave);
    }
  }

  disconnectedCallback() {
    if (this.hasAttribute(ATTRIBUTE_CLAIM)) {
      this.removeEventListener('keydown', onClaimKeydown);
      this.removeEventListener('focus', this.onFocus);
      this.removeEventListener('blur', this.onBlur);
    } else if (this.hasAttribute(ATTRIBUTE_CONTAINER)) {
      this.slotEl.removeEventListener('slotchange', this.onSlotChange);
      this.removeEventListener('click', onClaimClick);
      this.removeEventListener('mouseenter', this.onCtnEnter);
      this.removeEventListener('mouseleave', this.onCtnLeave);
    }
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