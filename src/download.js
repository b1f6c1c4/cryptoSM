export default function download(filename, xtext) {
  const e = document.createElement('a');
  e.setAttribute('href', `data:text/plain;charset=utf-8,${xtext}`);
  e.setAttribute('download', filename);
  e.style.display = 'none';
  document.body.appendChild(e);
  e.click();
  document.body.removeChild(e);
}
