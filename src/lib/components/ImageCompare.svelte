<!-- Taken from: https://codepen.io/stoumann/pen/VwKgJNv?editors=0100 -->

<script lang="ts">
  export let imageLeftSrc: string;
  export let imageRightSrc: string;
</script>

<div class="image-compare" style="--value: 50%;">
  <img class="image-compare__left" src={imageLeftSrc} alt="Compare Left" />
  <img class="image-compare__right" src={imageRightSrc} alt="Compare Right" />
  <input
    type="range"
    class="image-compare__range"
    min="0"
    max="100"
    value="50"
    on:input={(e) =>
      // @ts-ignore
      e.currentTarget.parentNode.style.setProperty("--value", `${e.currentTarget.value}%`)}
  />
</div>

<style>
  .image-compare {
    --h: 9;
    --m: 1rem 0;
    --w: 16;
    --thumb-bgc: #ff3e00;
    --thumb-bgc-focus: #ff3e0080;
    --thumb-w: 4px;

    margin: var(--m);
    position: relative;
    width: min(30vw, 600px);
  }
  .image-compare::after {
    content: "";
    display: block;
    padding-bottom: calc((var(--h) / var(--w)) * 100%);
  }
  .image-compare__left,
  .image-compare__right {
    width: 100%;
    height: auto;
    border-radius: 0.25rem;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }
  .image-compare__left {
    clip-path: polygon(0% 0%, var(--value) 0%, var(--value) 100%, 0% 100%);
  }
  .image-compare__right {
    clip-path: polygon(100% 0%, var(--value) 0%, var(--value) 100%, 100% 100%);
  }
  .image-compare__range {
    background-color: transparent;
    box-sizing: border-box;
    font-family: inherit;
    height: 100%;
    margin: 0;
    outline: none;
    position: absolute;
    top: 0;
    width: 100%;
  }
  .image-compare__range::-moz-range-thumb {
    background-color: var(--thumb-bgc);
    cursor: ew-resize;
    height: 100%;
    width: var(--thumb-w);
  }
  .image-compare__range::-webkit-slider-thumb {
    background-color: var(--thumb-bgc);
    cursor: ew-resize;
    height: 100%;
    width: var(--thumb-w);
  }
  .image-compare__range:focus::-webkit-slider-thumb {
    background-color: var(--thumb-bgc-focus);
    box-shadow: 0 0 0 3px var(--thumb-bgc);
  }
  .image-compare__range:focus::-moz-range-thumb {
    background-color: var(--thumb-bgc-focus);
    box-shadow: 0 0 0 3px var(--thumb-bgc);
  }
  .image-compare__range::-moz-range-track {
    background: transparent;
    background-size: 100%;
    box-sizing: border-box;
  }
  .image-compare__range::-webkit-slider-runnable-track {
    background: transparent;
    background-size: 100%;
    box-sizing: border-box;
    height: 100%;
  }
  .image-compare__range,
  .image-compare__range::-webkit-slider-runnable-track,
  .image-compare__range::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
  }
</style>
