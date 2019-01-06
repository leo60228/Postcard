var fileSelector = document.getElementById('map-bin-selector');
var authorSelector = document.getElementById('author-name');
var mapNameSelector = document.getElementById('map-name');
var download = () => {};
document.getElementById('form').addEventListener('submit', e => {
  e.preventDefault();
  var author = slugify(authorSelector.value, '_');
  var mapName = mapNameSelector.value;
  var levelsetSlug = slugify(mapName, '_');
  var bin = fileSelector.value.split(/(\\|\/)/g).pop();
  var dialog = createDialog({levelset: mapName, level: mapName, levelset_id: levelsetSlug, author, bin});
  var yaml = everestYaml(levelsetSlug);
  var zip = new JSZip();
  zip.file('everest.yaml', yaml);
  var dialogFolder = zip.folder('Dialog');
  dialogFolder.file('English.txt', dialog);
  var mapsFolder = zip.folder('Maps');
  var authorFolder = mapsFolder.folder(author);
  var levelsetFolder = authorFolder.folder(levelsetSlug);
  levelsetFolder.file(bin, fileSelector.files[0]);
  zip.generateAsync({type: 'blob'}).then(function(content) {
    download = () => saveAs(content, `${levelsetSlug}.zip`);
    document.body.className += ' done';
  });
});
document.getElementById('download-button').addEventListener('click', () => download());
