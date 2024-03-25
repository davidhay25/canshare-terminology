# Creating and uploading a ConceptMap

## Prerequisites

Install [node.js](https://nodejs.org/en) on the computer

## Process

1. In the google doc, use the File > download menu option to download a tab separated version of the sheet. Save with the filename __spreadsheet.tsv__ in the __conceptMap creation__ folder (this one) replacing the one already there
1. In the command line, move to the __conceptMap creation__ folder (this one)
1. execute the command __./makeConceptMapFromSS.js__. This will create the file __conceptmap.json__ in the folder. It will skip the first 2 lines.
1. If there are no errors, execute the command __./uploadConceptMap.js__
