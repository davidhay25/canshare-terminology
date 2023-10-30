# The work needed for the October release.

Main issue is that some of the urls for existing VS have changed. There's also
a change in the VS syntax to use ECL rather than referring to the refset directly

so:

1. Invalidate all existing Canshare VS (delete or set status to retired)
    retireAllApril.js
2. update the VS creation script to use ECL
    makeVS.js
3. Upload the refreshed April VS
    uploadVSBundle.js
4. Upload the October VS,
    uploadVSBundle.js

