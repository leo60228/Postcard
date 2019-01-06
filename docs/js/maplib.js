// if the module has no dependencies, the above pattern can be simplified to
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    Object.assign(root, factory(root.b));
  }
}(typeof self !== 'undefined' ? self : this, function () {
  let createDialog = ({levelset, level, levelset_id, author, bin}) => `
${author}_${levelset_id}= ${levelset}
${author}_${levelset_id}_${bin.replace(/\.bin$/, '')}= ${level}
`;

  let everestYaml = (name) => jsyaml.safeDump([{
    Name: name,
    Version: '1.0.0',
    Dependencies: [{
      Name: 'Everest',
      Version: '1.0.0'
    }]
  }]);
  
  return {createDialog, everestYaml};
}));
