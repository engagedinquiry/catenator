# Publish an app to GitHub Pages — parameterized

Set these values before running:

APP = reader-app
TARGET_REPO = https://github.com/engagedinquiry/catenator-single-topic.git
BASE_HREF = /
DIST_SUBFOLDER = dist/phase-0-single-topic/browser

---

If target does not exist, create a new public repo to be deployed on GitHub Pages


---

STEPS:

1. From inside apps/{APP}/output/, build with the specified base
   path:

   ng build --base-href {BASE_HREF}

2. Confirm the actual build output landed at {DIST_SUBFOLDER} — if
   not, STOP and report the real path found instead of guessing or
   proceeding with a mismatched path.

3. Add the 404 fallback for client-side routing:

   cp {DIST_SUBFOLDER}/index.html {DIST_SUBFOLDER}/404.html

4. Clone TARGET_REPO locally, if not already cloned, into a sibling
   folder (not inside catenator's own working tree).

5. Clear the target repo's existing content (except .git) and copy
   in the fresh build:

   rm -rf <target-repo-local-path>/*
   cp -r apps/{APP}/output/{DIST_SUBFOLDER}/* <target-repo-local-path>/

6. Commit and push:

   cd <target-repo-local-path>
   git add .
   git commit -m "Publish {APP} build"
   git push origin main

7. Confirm GitHub Pages is enabled on the target repo (Settings ->
   Pages -> Deploy from a branch -> main -> / root), if not already
   done once.

Report back: confirm the build succeeded, confirm DIST_SUBFOLDER
actually matched what was found on disk, confirm the push succeeded,
and give the resulting live Pages URL.