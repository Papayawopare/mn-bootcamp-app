# Configuration Findings

Name: Yaw Opare
Date: 6 November 2026
Repository: https://github.com/Papayawopare/mn-bootcamp-app
Application: bootcamp-app (Node.js, Express, SQLite), local training sandbox only

---

## 1. Dependency scan results

| Tool | Issues before | Issues after | Notes |
| --- | --- | --- | --- |
| Snyk Open Source | 41 (0 Critical, 18 High, 21 Medium, 2 Low), 79 vulnerable paths, 170 dependencies | 0, no vulnerable paths, 125 dependencies | Reached in two steps, see section 2 |
| OWASP Dependency-Check | Not yet run | Not yet run | Local install not completed; pipeline job being fixed, see section 5 |

### Snyk Open Source, progress by step

| Step | Action | Issues remaining |
| --- | --- | --- |
| Baseline | `snyk test` on the starter app | 41 |
| 1 | `npm install express@4 lodash@4` (express 4.17.1 to 4.22.3, lodash 4.17.15 to 4.18.1) | 17 |
| 2 | `npm install sqlite3@6.0.1` (major version upgrade) | 0 |

After each upgrade the app was retested: `npm start` runs and loads sqlite3 without errors.

---

## 2. Findings detail (Snyk Open Source baseline)

### 2.1 Findings by library

| Library (introduced through) | Issues | Highest severity | Weakness classes (CWE) | Fix |
| --- | --- | --- | --- | --- |
| lodash 4.17.15 (direct) | 8 (5 High, 3 Medium) | High | Prototype pollution (CWE-1321), code injection (CWE-94), ReDoS (CWE-1333) | Upgraded to 4.18.1 |
| qs 6.7.0 (via express) | 5 (4 High, 1 Medium) | High | Prototype poisoning (CWE-1321), resource allocation without limits (CWE-770), uncaught exception (CWE-248) | Upgraded with express 4.22.3 |
| body-parser 1.19.0 (via express) | 3 (2 High, 1 Medium) | High | Amplification and unthrottled resource use (CWE-405, CWE-770), uncaught exception (CWE-248) | Upgraded with express 4.22.3 |
| path-to-regexp 0.1.7 (via express) | 3 Medium | Medium | ReDoS (CWE-1333) | Upgraded with express 4.22.3 |
| express 4.17.1 (direct) | 2 Medium | Medium | Cross-site scripting (CWE-79), open redirect (CWE-601) | Upgraded to 4.22.3 |
| cookie 0.4.0 (via express) | 1 Medium | Medium | Cross-site scripting (CWE-79) | Upgraded with express 4.22.3 |
| send 0.17.1, serve-static 1.14.1 (via express) | 2 Low | Low | Cross-site scripting (CWE-79) | Upgraded with express 4.22.3 |
| tar 6.2.1 (via sqlite3) | 12 (5 High, 7 Medium) | High | Directory traversal (CWE-22), symlink attack (CWE-59), infinite loop (CWE-835), unbounded resource allocation (CWE-770), uncontrolled recursion (CWE-674) | Removed by upgrading sqlite3 to 6.0.1 |
| http-cache-semantics 4.3.0 (via sqlite3 > node-gyp) | 2 High | High | Origin validation error (CWE-346), improper authorization (CWE-285) | No direct fix at baseline; removed with sqlite3 6.0.1 |
| inflight, minimatch, @tootallnate/once (via sqlite3 > node-gyp) | 3 Medium | Medium | Resource not released (CWE-772), amplification (CWE-405), control flow scoping | No direct fix at baseline; removed with sqlite3 6.0.1 |

### 2.2 Totals check

| Group | Issues |
| --- | --- |
| express and its dependencies | 16 |
| lodash | 8 |
| sqlite3 (tar) | 12 |
| sqlite3 (no direct fix) | 5 |
| **Total** | **41** |

### 2.3 Observations

- Both the 12 tar findings and the 5 findings with no direct fix came from sqlite3's install-time tooling (node-gyp). Upgrading sqlite3 to 6.0.1 removed 74 packages and with them all 17 findings.
- npm reported one install-script warning for sqlite3@6.0.1 (`prebuild-install -r napi || node-gyp rebuild`). It is a warning, not an error, and the app runs. Noted for later review.
- Direct dependencies were the main source of exposure: express and lodash accounted for 24 of 41 issues.

---

## 3. Configuration issues

| # | Setting or issue | Risk | Fix | Status | Evidence |
| --- | --- | --- | --- | --- | --- |
| 1 | X-Powered-By header and missing security headers | Reveals software, weaker browser protection | Helmet | To record | DevTools response headers, before and after |
| 2 | Stack traces shown to visitors | Leaks file paths and internals | Error handler and `NODE_ENV=production` | To record | `/settings?data=bad` before and after |
| 3 | Secrets written in code | Anyone with repository access can read them | Environment variables, `.env.example` | To record | `git log -p -S "Admin@12345"` shows the old value stays in history |
| 4 | No access control on admin function | Anyone could use it | Deny by default with API key check | To record | `curl.exe` output with and without the key |
| 5 | Outdated libraries | Known CVEs | Updated express, lodash and sqlite3 | **Done** | Snyk before (41) and after (0), section 1 |

---

## 4. Environment and tooling

| Item | Detail |
| --- | --- |
| Operating system | Windows, PowerShell |
| Project folder | `C:\Users\THE DEVICE OUTLET\labs\bootcamp-app` |
| Snyk | CLI installed and authenticated; organisation `papayawopare`; scans run against `package-lock.json` |
| Source control | GitHub repository `Papayawopare/mn-bootcamp-app`, branch `main` |
| Repository secrets | `SNYK_TOKEN` and `NVD_API_KEY` added in GitHub Actions secrets |

---

## 5. Pipeline (GitHub Actions)

Workflow file: `.github/workflows/security.yml`, triggered on push and pull request. Two jobs: `snyk` (SCA and SAST, fail on High) and `dependency-check` (fail on CVSS 7 or higher).

### Run #1 ("Add security pipeline"): failed, both jobs

| Job | Result | Cause | Action taken or planned |
| --- | --- | --- | --- |
| snyk | Failed at SCA step in 4 seconds. Authentication error SNYK-0005, 401 Unauthorized | The `SNYK_TOKEN` secret was not accepted | Generate a fresh token in Snyk Account settings, test it locally with `snyk test`, then update the GitHub secret |
| snyk (SAST step) | Skipped, because the SCA step failed first | Default behaviour after a failed step | Add `if: always()` to the SAST step so both scans report |
| dependency-check | Failed after 6 seconds | The ready-made action runs with `--noupdate` and a fresh runner has no vulnerability database | Replace the action with a step that downloads and runs the Dependency-Check command line directly |

These were setup failures, not security findings. Next run should show real results.

### Pending

- Push the corrected workflow and the sqlite3 upgrade, then record the new run result
- Record the first full Dependency-Check results and the three highest CVSS scores with their CVE numbers
- Run Snyk Code (SAST) and record the results

---

## 6. Remaining findings to handle (triage)

| # | Finding | Where | Likelihood (1-3) | Impact (1-3) | Rating | Effort | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | To be filled from the next pipeline run and the Dependency-Check report | | | | | | |

Rating key: likelihood multiplied by impact. 1 to 2 Low, 3 to 4 Medium, 6 High, 9 Critical.

### Accepted risks (reason, owner, review date)

None recorded so far. After the sqlite3 upgrade, Snyk Open Source reports no open issues.

---

## 7. Lessons so far

- Upgrading a single direct dependency can remove a large number of findings, because most vulnerable packages are transitive. Express alone brought in 16.
- A major version upgrade (sqlite3 5 to 6) cleared findings that had no direct fix, but it needs a retest of the app.
- A failing pipeline needs reading before it is trusted: both first-run failures came from setup (token, database flag), not from vulnerabilities.
- Never put tokens in chat, code or reports. Secrets belong in GitHub secrets or environment variables, and any exposed token must be rotated.