const fs = require('fs');
const pug = require('pug');
const autoprefixer = require('autoprefixer');

const templateFunc = pug.compileFile('./templates/testcase.pug');

const data = JSON.parse(fs.readFileSync('./testcases/data.json', 'utf-8'));
let clippingContent = '';
let maskingContent = '';


for (let key in data.testcases) {
  const dataThemes = data.testcases[key];
  let nb = 1;
  dataThemes.forEach(testcase => {
    let CSS, SVG;
    try {
      CSS = fs.readFileSync('./testcases/' + testcase.id + '.css', 'utf-8');
      SVG = fs.readFileSync('./testcases/' + testcase.id + '.svg', 'utf-8');
    } catch (e) {}
    const sandboxCSS = handleSandbox(CSS, testcase.id);
    testcase.CSS = CSS;
    testcase.sandboxCSS = sandboxCSS;
    testcase.SVG = SVG;
    testcase.nb = nb;
    testcase.type = key.substr(0,1).toUpperCase();
    const fn = templateFunc(testcase);
    if (key == 'clipping') {
      clippingContent += fn;
    } else if (key == 'masking') {
      maskingContent += fn;
    }
    nb++;
  });
  
}

let result = pug.renderFile('./templates/index.pug', {clipping: clippingContent, masking: maskingContent});
fs.writeFileSync('index.html', result);

function handleSandbox (code, id) {
  // prefix first
  code = autoprefixer.process(code).css;
  // cleanup
  code = code.replace(/^\s+/g,'').replace(/\s+$/g,'');
  var reg = /(\{|\})/g;
  code = code.split(reg);
  for (var i = 0; i < code.length - 1; i+=4) {
    var selectors = code[i].split(',');
    for (var j = 0; j < selectors.length; j++) {
      selectors[j] = '#js-' + id + ' ' + selectors[j];
    }
    code[i] = selectors.join(',');
  }
  return code.join('');
}