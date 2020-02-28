module.exports = {
  IMAGE_CATS: {
    icons: {
      itemsKey: 'icons',
      displayNamePlural: 'Icons',
      preferPNGFormat: false,
      previewsToUpload: [],
      formatsToUpload: [
        {
          format: 'png'
        },
        {
          format: 'skla'
        },
        {
          format: 'svg'
        }
      ]
    },
    components: {
      itemsKey: 'components',
      displayNamePlural: 'Components',
      preferPNGFormat: true,
      formatsToUpload: [
        {
          format: 'png'
        },
        {
          format: 'skla'
        }
      ],
      previewsToUpload: [
        {
          fileNameSuffix: '-thumb-300',
          format: 'png',
          maxLongEdge: 300
        }
      ]
    },
    sketchSymbols: {
      formatsToUpload: [
        {
          format: 'png'
        },
        {
          format: 'skla'
        }
      ],
      previewsToUpload: [
        {
          fileNameSuffix: '-thumb-300',
          format: 'png',
          maxLongEdge: 300
        }
      ]
    }
  },
  TYPES_TO_SYNC: {
    colors: { key: 'colors', label: 'Colors', description: 'Added to “Document Colors”' },
    typeStyles: { key: 'typeStyles', label: 'Text Styles' },
    sharedStyles: { key: 'sharedStyles', label: 'Layer Styles' },
    symbols: { key: 'symbols', label: 'Symbols' }
  },
  INDEX: {
    fontPSName: 0,
    fontFaceName: 1,
    fontWeight: 2,
    fontTraits: 3
  },
  gridSize: {
    md: 120,
    sm: 90,
    xs: 60
  },
  editingSources: {
    styleguidePage: 'styleguidePage',
    styleguideTree: 'styleguideTree'
  },
  libraryHierarchyLevels: {
    asset: 'asset',
    subFolder: 'subFolder',
    rootFolder: 'rootFolder',
    container: 'container'
  },
  exampleLibrary: {
    apiUrl: 'https://dsmexample.invisionapp.com/dsm-api',
    organization: 'in-vision-dsm',
    name: 'Example Library',
    kebabName: 'example-library',
    url: 'https://dsmexample.invisionapp.com/dsm/in-vision-dsm/example-library',
    webHost: 'https://dsmexample.invisionapp.com'
  },
  selectionTypes: {
    single: 'single',
    nonadjacent: 'nonadjacent',
    group: 'group'
  },
  DSM_LIBRARY_METADATA_KEY: 'libraryMetadata'
};
