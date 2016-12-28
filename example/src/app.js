import load from './entries';

document.querySelector("#btnLoad").addEventListener("click", () => {
  const entry = document.querySelector("#entry").value;
  load(entry).then(content => {
    console.log(content);
  });
})