# The work needed for the October release.

Main issue is that some of the urls for existing VS have changed. There's also
a change in the VS syntax to use ECL rather than referring to the refset directly

so:





Links:

FHIR VS (OCT 23)

 - https://docs.google.com/spreadsheets/d/1S-08cA1m-CAy8humztO0S5Djr_wtXibmNn6w4_uFCIE/edit#gid=41348090



FHIR VS (APR 23) - https://docs.google.com/spreadsheets/d/1S-08cA1m-CAy8humztO0S5Djr_wtXibmNn6w4_uFCIE/edit#gid=849242023

"compose": {

    "include": [

      {
        "system": "http://snomed.info/sct",
        "version": "http://snomed.info/sct/21000210109",
        "filter": [

          {

            "property": "constraint",
            "op": "=",
            "value": "^301761000210107"
          }
        ]
      }
    ]
  }


1. Invalidate all existing Canshare VS (delete or set status to retired)
    retireAllApril.js
2. update the VS creation script to use ECL
    makeVS.js
3. Upload the refreshed April VS
    uploadVSBundle.js
4. Upload the October VS,
    uploadVSBundle.js

