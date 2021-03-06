/* global slugify URL CogBinEl CogBinElLoader CogDataWebSrc createDialog everestYaml JSZip saveAs fetch history */
let fileSelector = document.getElementById('map-bin-selector');
let authorSelector = document.getElementById('author-name');
let mapNameSelector = document.getElementById('map-name');
let blob = () => fileSelector.files[0];
let name = () => fileSelector.value.split(/(\\|\/)/g).pop();
(async () => {
  if (window.location.hash.split(':').length == 2) {
    let fileLabel = fileSelector.parentElement;
    fileLabel.parentElement.removeChild(fileLabel);
    let dataUri = `data:application/octet-stream;base64,${window.location.hash.split(':')[1]}`;
    let hashBlob = await (await fetch(dataUri)).blob();
    blob = () => hashBlob;
    let hashName = window.location.hash.split(':')[0].replace(/^#/, '');
    name = () => hashName;
    history.replaceState("", document.title, window.location.pathname + window.location.search);
  }
})(); // async initialization
let download = () => {};
document.getElementById('form').addEventListener('submit', async e => {
  e.preventDefault();
  let author = slugify(authorSelector.value, '_');
  let mapName = mapNameSelector.value;
  let levelsetSlug = slugify(mapName, '_');
  let bin = name();
  let dialog = createDialog({levelset: mapName, level: mapName, levelset_id: levelsetSlug, author, bin});
  let yaml = everestYaml(levelsetSlug);
  let zip = new JSZip();
  zip.file('everest.yaml', yaml);
  let dialogFolder = zip.folder('Dialog');
  dialogFolder.file('English.txt', dialog);
  let mapsFolder = zip.folder('Maps');
  let authorFolder = mapsFolder.folder(author);
  let levelsetFolder = authorFolder.folder(levelsetSlug);
  levelsetFolder.file(bin, blob());
  let content = await zip.generateAsync({type: 'blob'});
  download = () => saveAs(content, `${levelsetSlug}.zip`);
  document.body.className += ' done';
});
document.getElementById('download-button').addEventListener('click', () => download());
