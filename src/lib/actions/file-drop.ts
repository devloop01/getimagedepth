import type { Action } from "svelte/action";

export type FileDropEvent = CustomEvent<{ file: File }>;

export const fileDrop: Action<
  HTMLElement,
  undefined,
  {
    "on:filedrop": (event: FileDropEvent) => void;
  }
> = (node) => {
  const handleDrop = (event: DragEvent) => {
    event.preventDefault();

    const file = event.dataTransfer?.files[0];
    if (file) {
      // const reader = new FileReader();
      // reader.onload = () => {

      // };
      // reader.readAsDataURL(file);

      node.dispatchEvent(new CustomEvent("filedrop", { detail: { file } }));
    }
  };

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault();
  };

  node.addEventListener("drop", handleDrop);
  node.addEventListener("dragover", handleDragOver);

  return {
    destroy() {
      node.removeEventListener("drop", handleDrop);
      node.removeEventListener("dragover", handleDragOver);
    },
  };
};
