# Security update for CVE-2026-102989

Pinned @tanstack/react-start to 1.168.60 and its directly imported @tanstack/react-router to 1.170.41, matching the Start package dependency. Regenerated bun.lock with Bun 1.4.3. The resolved @tanstack/start-server-core is 1.169.39.

Official advisory: https://github.com/TanStack/router/security/advisories/GHSA-qx66-fv34-fjm8

Validation: frozen-lockfile dependency installation completed. A full local build reached asset processing but could not finish because the connector could not download private repository images. The image files remain present in the GitHub repository; no images are deleted by this change. A successful Vercel build/runtime check remains required.

After these changes are approved and merged into the branch used by Vercel, redeploy that commit. Do not enable DANGEROUSLY_DEPLOY_VULNERABLE_TANSTACK_START_XSS. No deployment or repository rename is performed by this commit.
