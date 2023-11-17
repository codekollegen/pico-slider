import styles from './styles.scss?inline';
import { Attribute, Component } from 'webcjs';

const namespace = 'pico-slider';

const events = {
  loadingProgress: 'loading-progress',
  finishedLoading: 'finished-loading',
};

@Component
class PicoSlider extends HTMLElement {
  @Attribute()
  selectedIndex = 0;

  /* public members */
  shadowRoot: ShadowRoot;

  /* private members */
  private loadedImagesCount;
  private renderComplete;
  private images: HTMLImageElement[];
  private galleryRef?: Element;
  private loadingRef?: Element;
  private loadedRef?: Element;
  private totalRef?: Element;

  constructor() {
    super();
    this.shadowRoot = this.attachShadow({ mode: 'open' });

    this.loadedImagesCount = 0;
    this.renderComplete = false;
    this.images = [];
  }

  connectedCallback() {
    this.addClickListener();
    this.addSlotChangeListener();
    this.render();
    this.checkProgress();
  }

  checkProgress() {
    return new Promise((resolve) => {
      const cycle = () => {
        if (this.renderComplete) {
          this.addScrollListener();
          return resolve(true);
        } else {
          this.showIfImagesLoaded();
          requestAnimationFrame(cycle);
        }
      };

      cycle();
    });
  }

  imageLoaded() {
    this.loadedImagesCount++;
    this.emit({
      name: events.loadingProgress,
      payload: { loadedImagesCount: this.loadedImagesCount, totalImageCount: this.images.length },
    });

    if (this.loadedRef) {
      this.loadedRef.innerHTML = `${this.loadedImagesCount}`;
    }
  }

  showIfImagesLoaded() {
    if (this.loadedImagesCount === 0 && this.images?.length === 0) {
      return;
    }

    if (this.loadedImagesCount >= this.images?.length) {
      this.loadingRef?.remove();
      this.scrollToSelectedIndex();
      this.renderComplete = true;

      this.emit({ name: events.finishedLoading, payload: this.images });
    }
  }

  addClickListener() {
    this.shadowRoot.addEventListener('click', ({ target }) => {
      const { action } = (target as HTMLElement).dataset;

      if (action === 'prev') {
        this.selectedIndex = this.selectedIndex >= 1 ? this.selectedIndex - 1 : 0;
        this.scrollToSelectedIndex();
      }

      if (action === 'next') {
        this.selectedIndex =
          this.selectedIndex < this.images.length - 1 ? this.selectedIndex + 1 : this.images.length - 1;
        this.scrollToSelectedIndex();
      }
    });
  }

  addSlotChangeListener() {
    this.shadowRoot.addEventListener('slotchange', (ev) => {
      const slot = ev.target as HTMLSlotElement;
      this.images = slot?.assignedElements() as HTMLImageElement[];

      if (this.totalRef) {
        this.totalRef.innerHTML = `${this.images.length}`;
      }

      this.images.forEach((image) => {
        image.classList.add('pico-slider__item');
        image.setAttribute('loading', 'lazy');
        image.removeAttribute('width');
        image.removeAttribute('height');
        image.onload = () => this.imageLoaded();

        if (image.complete) {
          this.imageLoaded();
        }
      });
    });
  }

  addScrollListener() {
    let scrollingTimeout: NodeJS.Timeout;

    this.galleryRef?.addEventListener('scroll', (ev) => {
      clearTimeout(scrollingTimeout);

      scrollingTimeout = setTimeout(() => {
        const scrollLeft = this.galleryRef?.scrollLeft ?? 0;
        this.selectedIndex = this.images.findIndex((image) => {
          return image.offsetLeft <= scrollLeft && image.offsetLeft + image.clientWidth >= scrollLeft;
        });
      }, 100);
    });
  }

  scrollToSelectedIndex() {
    this.galleryRef?.scrollTo({
      left: this.images[this.selectedIndex].offsetLeft,
      behavior: 'smooth',
    });
  }

  emit<T>({ name, payload }: { name: string; payload: T }) {
    this.dispatchEvent(
      new CustomEvent(name, {
        bubbles: true,
        cancelable: true,
        composed: true,
        detail: payload,
      })
    );
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <div class="${namespace}-container">
        <button class="${namespace}-navigation ${namespace}-navigation--prev" data-action="prev"></button>
        <button class="${namespace}-navigation ${namespace}-navigation--next" data-action="next"></button>
        <div class="${namespace}-loading-overlay">
          <div>
            <span class="${namespace}-loading-overlay__loaded">0</span> von <span class="${namespace}-loading-overlay__total">${this.images.length}</span> Bildern geladen...  
          </div>
        </div>
        <div class="${namespace}">
          <slot></slot>
        </div>
      </div>
    `;

    this.galleryRef = this.shadowRoot.querySelector(`.${namespace}`)!;
    this.loadingRef = this.shadowRoot.querySelector(`.${namespace}-loading-overlay`)!;
    this.loadedRef = this.shadowRoot.querySelector(`.${namespace}-loading-overlay__loaded`)!;
    this.totalRef = this.shadowRoot.querySelector(`.${namespace}-loading-overlay__total`)!;
  }
}

if (!customElements.get(namespace)) {
  customElements.define(namespace, PicoSlider);
}

export default PicoSlider;
