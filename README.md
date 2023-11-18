# Pico Slider

A simple lightweight custom webcomponent apporach of an image slider, that can be integrated on a website.

## Install

If you want to use the pico slider in your project, you can install via the package manger of your choice.

```sh
pnpm i pico-slider
```

## CDN

You can also just add the script tag to your website, and load pico slider from a cdn. Using the pico slider via cdn is
recommended.

```html
<script src="https://unpkg.com/pico-slider/dist/index.js" async defer></script>
```

## Usage

After including your script into your project you can use the new custom tag created by the webcomponent

```html
<pico-slider selected-index="0">
  <img src="" alt="" title="" ... />
  <img src="" alt="" title="" ... />
  ...
</pico-slider>
```

## Custom Elements

When you first create the custom tag the pico slider script might not have been loaded yet. Since the script is
defered it might be available later in the loading process of the browser.

You can react to different states of your custom webcomponent with the `customElements` property and the `:defined` pseudoselector in css.

While not defined, the pico slider tag won't do anything special expect from sitting around on your page.

### Examples

```js
customElements.whenDefined('pico-slider').then(() => {
  // pico-slider is now defined
});
```

```css
pico-slider:not(:defined) {
  display: none;
}
```

## Events

The Pico Slider component emits events that you can listen to. The currently emited events are:

- pico-slider.loading-progress
- pico-slider.finished-loading

You can easily listen to those events via a vanilla js event listener either on the document or the element itself.

### Examples

```js
document.addEventListener('pico-slider.loading-progress', ({ detail }) => {
  console.log('loading progress', detail);
  // do stuff
});

// Alternativley
const picoSlider = document.querySelector('pico-slider');
picoSlider.addEventListener('pico-slider.loading-progress', ({ detail }) => {
  console.log('loading progress', detail);
  // do stuff
});
```

Bear in mind that you might want to work with identifiers if you have more that one instance of the Pico Slider on your page.
