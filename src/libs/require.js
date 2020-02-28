/* global COScript NSData NSString NSUTF8StringEncoding NSURL */

const ___REQUIRE_BASE_URL___ = COScript.currentCOScript().env().objectForKey('scriptURL');
const ___MODULES___ = {};

function ___REQUIRE___(identifier) { // eslint-disable-line no-unused-vars
  if (!this.scriptURL) {
    throw 'No script URL available in the Cocoascript environment, which is necessary for require() to work.';
  }

  if (typeof identifier !== 'string' || identifier.length === 0) {
    throw 'Required paths must be non-zero length string';
  }

  const terms = identifier.split('/');

  if (terms[0] !== '.' && terms[0] !== '..') {
    // Top-level identifier.
    throw `Top-level identifiers are not supported! '${identifier}' was given. Try starting with '.' or '..'`;
  }

  const importURL = this.scriptURL
    .URLByDeletingLastPathComponent() // Containing dir
    .URLByAppendingPathComponent(identifier + '.js') // Add the require()’d identifier
    .URLByStandardizingPath(); // Resolve '.' and '..'

  const script = COScript.currentCOScript();

  const alreadyLoadedModule = ___MODULES___[importURL.path()];

  if (alreadyLoadedModule) {
    return alreadyLoadedModule;

  } else {

    const origShouldPreprocess = script.shouldPreprocess();
    script.setShouldPreprocess(false);

    const importedData = NSData.dataWithContentsOfURL(importURL);
    if (importedData === null) {
      throw `Unable to import file '${importURL.path()}' (from '${this.scriptURL.path()}'). Does the file exist?`;
    }

    const moduleCode = NSString.alloc().initWithData_encoding(importedData, NSUTF8StringEncoding);

    // Keep all the following on one line so we don’t mess up line numbers when
    // reporting errors.
    const modulePreambleCode = '(function(){' +
      'const module={exports:{}};' +
      'const exports=module.exports;' +
      'const require=___REQUIRE___.bind({scriptURL: NSURL.fileURLWithPath("' + importURL.path().replace('"', '\\"') + '")});' +
      '/* MODULE BEGIN */';
    const modulePostambleCode = '/* MODULE END */return module.exports;});';

    const displayPath = importURL.absoluteString()
      .replace(___REQUIRE_BASE_URL___.URLByDeletingLastPathComponent(), '');

    const module = script.executeString_baseURL(
      modulePreambleCode + moduleCode + modulePostambleCode,
      NSURL.URLWithString(displayPath)
    );

    if (module === null) {
      throw `Unable to import file '${importURL.path()}' (from '${this.scriptURL}'). The module contains an error.`;
    }

    // It’s important to call the module here, and not in the string passed to
    // executeString_baseURL(). This way we get back plain JS objects, which is
    // what you would expect, otherwise you get conversions Array->NSArray,
    // Object->NSDictionary, etc. which is unexpected.
    const exports = module();

    ___MODULES___[importURL.path()] = exports;

    script.setShouldPreprocess(origShouldPreprocess);

    return exports;
  }
}

const require = ___REQUIRE___.bind({ // eslint-disable-line no-unused-vars
  scriptURL: ___REQUIRE_BASE_URL___
});
