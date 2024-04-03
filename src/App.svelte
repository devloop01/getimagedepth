<script lang="ts">
  import { onMount } from "svelte";
  import { Toaster, toast, type ToasterProps } from "svelte-sonner";

  import { downloadDataURL } from "$lib/utils";
  import { fileDrop, type FileDropEvent } from "$lib/actions/file-drop";

  import ImageCompare from "$lib/components/ImageCompare.svelte";

  let theme = "light" as ToasterProps["theme"];

  let originalFile: File | null = null;
  let originalImageSrc: string | null = null;
  let depthImageSrc: string | undefined;

  let worker: Worker | undefined;
  let progressItems: { file: string; progress: number }[] = [];
  let isReady = true;

  onMount(() => {
    const handleThemeChange = (e: MediaQueryListEvent) => {
      theme = e.matches ? "dark" : "light";
    };

    const matchmedia = window.matchMedia("(prefers-color-scheme: dark)");

    if (matchmedia.matches) theme = "dark";
    matchmedia.addEventListener("change", handleThemeChange);

    return () => {
      matchmedia.removeEventListener("change", handleThemeChange);
    };
  });

  onMount(() => {
    worker = new Worker(new URL("$lib/worker.ts", import.meta.url), { type: "module" });

    worker.addEventListener("message", handleWorkerMessage);

    return () => {
      worker?.removeEventListener("message", handleWorkerMessage);
      worker?.terminate();
    };
  });

  function handleWorkerMessage(event: MessageEvent) {
    const { data } = event;

    switch (data.status) {
      case "initiate":
        isReady = false;
        progressItems = [...progressItems, { file: data.file, progress: 0 }];
        break;

      case "progress":
        progressItems = progressItems.map((item) => {
          if (item.file === data.file) {
            const progress = data.progress;
            toast.loading(`${item.file} ${progress.toFixed(0)}%`, { id: item.file });
            return { ...item, progress };
          }
          return item;
        });
        break;

      case "done":
        progressItems = progressItems.filter((item) => {
          if (item.file === data.file) {
            toast.success(`Loaded ${item.file}`, { id: item.file, duration: 2000 });
            return false;
          }
          return true;
        });
        break;

      case "ready":
        isReady = true;
        toast.success("Model Ready");
        break;

      case "analyzing":
        isReady = false;
        depthImageSrc = undefined;
        toast.loading("Analyzing...", { id: "analyzing", duration: Infinity });
        break;

      case "complete":
        isReady = true;
        depthImageSrc = data.output;
        toast.success("Completed", { id: "analyzing", duration: 2000 });
        downloadImage();
        break;
    }
  }

  const handleFileDrop = (event: FileDropEvent) => {
    const { file } = event.detail;

    if (!file.type.startsWith("image/")) {
      toast.error("Please drop an image file");
      return;
    } else if (!file.type.match(/image\/(png|jpeg|jpg|webp)/)) {
      toast.error("Format not supported", {
        description: "only PNG, JPEG, and WEBP files are supported",
        duration: 4000,
      });
      return;
    }

    originalFile = file;
    originalImageSrc = URL.createObjectURL(file);

    worker?.postMessage({ imageSrc: originalImageSrc });
  };

  const handleFileInput = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    originalFile = file;
    originalImageSrc = URL.createObjectURL(file);

    worker?.postMessage({ imageSrc: originalImageSrc });
  };

  function downloadImage() {
    if (!originalFile || !depthImageSrc) {
      toast.error("No depth image to download");
      return;
    }

    const filename = originalFile.name.replace(/\.[^/.]+$/, "");
    const fileExt = originalFile.name.split(".").pop();
    downloadDataURL(depthImageSrc, `${filename}-depth.${fileExt}`);
  }
</script>

<Toaster {theme} position="bottom-left" />

<main use:fileDrop on:filedrop={handleFileDrop}>
  <label class="file-label" style:pointer-events={isReady ? "auto" : "none"}>
    <input
      type="file"
      accept="image/jpeg, image/png, image/webp"
      hidden
      on:click={(e) => (e.currentTarget.value = "")}
      on:change={handleFileInput}
    />
  </label>

  {#if originalImageSrc}
    {#if depthImageSrc}
      <ImageCompare imageLeftSrc={originalImageSrc} imageRightSrc={depthImageSrc} />
    {:else}
      <div class="image-wrapper">
        <img src={originalImageSrc} alt="Dropped File Overview" />
      </div>
    {/if}
  {:else}
    <span class="cta shine">Drop Your Image Here</span>
  {/if}
</main>

<style lang="postcss">
  main {
    position: relative;
    width: 100%;
    height: 100%;
    display: grid;
    place-content: center;
    overflow: hidden;
  }

  .file-label {
    position: absolute;
    inset: 0;
  }

  .cta {
    font-size: clamp(0.8rem, 5vw, 1.2rem);
    font-weight: 600;
    color: inherit;
    pointer-events: none;
    user-select: none;
    opacity: 0.8;
  }

  .image-wrapper {
    width: min(30vw, 600px);

    & img {
      width: 100%;
      height: auto;
      display: block;
      border-radius: 0.25rem;
      user-select: none;
      pointer-events: none;
    }
  }

  .shine {
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
    background-image: linear-gradient(to right, #222, #fff, #222);
    background-repeat: no-repeat;
    background-size: 50%;
    animation-name: shine;
    animation-duration: 3s;
    animation-iteration-count: infinite;
    text-shadow: 0 0px 0px rgba(255, 255, 255, 0.5);
  }

  @keyframes shine {
    0% {
      background-position: -100%;
    }
    100% {
      background-position: 200%;
    }
  }
</style>
