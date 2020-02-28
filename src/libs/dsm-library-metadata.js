/* global NSDate */
const persist = require('./persistence');
const util = require('./util');

const { DSM_LIBRARY_METADATA_KEY } = require('../shared/constants');

function updateLibraryMetadata(context) {
  const styleData = persist.get('dsmStyleData');
  const styleguide = styleData && styleData.styleguide;

  if (styleguide) {
    const librariesMetadata = util.getDocumentUserInfoForDSM(context, DSM_LIBRARY_METADATA_KEY);

    const styleguideId = styleguide._id;
    const data = { styleguideId: styleguideId, name: styleguide.name, updatedOn: NSDate.date().description() };
    if (styleguide.snapshotId) {
      data.versionId = styleguide.snapshotId;
    }

    librariesMetadata[styleguideId] = data;

    util.updateDocumentUserInfoForDSM(context, DSM_LIBRARY_METADATA_KEY, librariesMetadata);
  }
}

module.exports = updateLibraryMetadata;
