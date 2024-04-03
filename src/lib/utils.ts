export function downloadDataURL(dataURL: string, filename: string) {
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = dataURL;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
