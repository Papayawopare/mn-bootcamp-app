# Secure Development Checklist

Name: Fellow
Date: 5 November 2026

## 1. Pipeline map

| Stage | Security activity | Example tool | Gate (what blocks progress) |
| --- | --- | --- | --- |
| Plan | Write security requirements and assess risk | Checklist, gap analysis | Requirements approved |
| Design | Threat modelling | STRIDE | Top threats have countermeasures |
| Code | Scan while you type and peer review | SonarQube for IDE, Snyk IDE plugin | No hard-coded secrets, pull request reviewed |
| Build | SAST, SCA and secrets scan | Snyk, Dependency-Check | No new High or Critical findings |
| Test | Security tests and DAST | OWASP ZAP, penetration test | No open High findings |
| Deploy | Harden configuration and protect secrets | Security headers, secrets manager | Configuration checklist signed off |
| Operate | Monitor, patch and audit | Dependabot, logs, scheduled scans | Critical patches within agreed time |

## 2. My own additions (one more security activity for each stage)

- My own additions (one more security activity for each stage)

- Plan: Security training
- Design: Secure architecture review
- Code: Secrets scanning
- Build: Dependency scanning
- Test: DAST scanning
- Deploy: Hardened configuration
- Operate: Incident response

## 3. My pass or fail rules for three gates

1. Gate: Build. Rule: the build fails if Snyk reports any High or Critical issue.
2. Gate:
3. Gate:

## 4. SonarQube for IDE warnings I saw in app.js
This framework implicitly discloses version information by default. I will make sure it is safe here