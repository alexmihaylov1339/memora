# Review Incident Rollback Drill (2026-04-27)

**Status:** Completed (tabletop rollback simulation)  
**Date:** 2026-04-27  
**Owner:** Backend + Frontend + On-call  
**Step reference:** `docs/plans/step-15-production-rollout-calibration-reliability.md` (T4)

---

## Purpose

Validate the review rollout incident response and rollback protocol from:
- `docs/operations/review-rollout-playbook.md`
- `docs/operations/review-observability.md`

This was a controlled tabletop drill. No production deployment was changed, and no real users were affected.

---

## Scenario

Simulated incident:
- production canary at 5%
- `invalid_payload` unsupported rate reaches `>= 5%` for 15 minutes
- p95 grade latency remains below critical threshold
- queue fetch volume remains within baseline

Rollback trigger exercised:
- `invalid_payload` rate `>= 5%` for 15 minutes

Operational target:
- freeze rollout immediately
- execute rollback protocol end-to-end inside a 30-minute operational window
- validate ownership routing and incident communication chain

---

## Roles

| Role | Owner | Responsibility |
|---|---|---|
| Incident commander | On-call | Own incident timeline, go/no-go decision, and status updates |
| Release owner | Backend | Freeze rollout and execute rollback command sequence |
| Frontend observer | Frontend | Check UI event health and user-facing review state |
| Scribe | On-call | Capture timestamps, decision log, and follow-up item |

---

## Drill timeline

| Time | Step | Owner | Evidence / outcome |
|---|---|---|---|
| 2026-04-27 11:31 EEST | Alert received | On-call | Simulated critical alert: `invalid_payload` rate `>= 5%` for 15m |
| 2026-04-27 11:33 EEST | Alert acknowledged | On-call | Acknowledged within 2 minutes; critical SLA target is 10 minutes |
| 2026-04-27 11:35 EEST | Incident channel opened | On-call | Simulated incident channel: `#incident-review-rollout-2026-04-27` |
| 2026-04-27 11:37 EEST | Rollout frozen | Release owner | Canary expansion stopped; simulated canary remains pinned before rollback |
| 2026-04-27 11:41 EEST | Trigger confirmed | Backend + On-call | Reason split points to `invalid_payload`; latency and queue volume not primary triggers |
| 2026-04-27 11:44 EEST | Rollback started | Release owner | Simulated previous known-good release artifact selected |
| 2026-04-27 11:49 EEST | Rollback completed | Release owner | Simulated release hash/version reverted successfully |
| 2026-04-27 11:59 EEST | Rollback health checked | Backend + Frontend | 10-minute post-rollback check completed; alert trend improving in tabletop scenario |
| 2026-04-27 12:01 EEST | Incident update posted | Incident commander | Trigger, rollback timestamp, and health status posted |
| 2026-04-27 12:03 EEST | Follow-up opened | Scribe | Postmortem task drafted with root-cause hypothesis and guardrail follow-ups |

Elapsed time:
- alert to acknowledgement: 2 minutes
- alert to rollout freeze: 6 minutes
- alert to rollback completion: 18 minutes
- alert to health validation: 28 minutes

Outcome:
- **PASS**

---

## Communication chain

1. On-call receives critical alert and acknowledges.
2. On-call opens incident channel and assumes incident commander role.
3. Release owner confirms current and previous release versions.
4. Backend checks unsupported reason split and grade latency.
5. Frontend checks review UI event health.
6. Incident commander approves rollback.
7. Release owner executes rollback protocol.
8. Incident commander posts status update and follow-up owner.

---

## Rollback protocol validation

| Playbook step | Drill result | Notes |
|---|---|---|
| Freeze rollout | PASS | Expansion stopped before rollback sequence |
| Execute rollback | PASS | Previous known-good artifact selected and simulated as active |
| Validate rollback health | PASS | 10-minute post-rollback health check completed |
| Communicate | PASS | Incident update included trigger, rollback timestamp, and current health |
| Capture follow-up | PASS | Postmortem task drafted |

---

## Follow-up items

| Item | Severity | Owner | Due |
|---|---|---|---|
| Replace generic deployment-command placeholders with platform-specific commands once production platform access is available | Medium | Release owner | Before broad production expansion |
| Attach real dashboard screenshots during the first live rollback or canary incident | Medium | On-call | Next live incident/canary retry |
| Add rollback hash/version fields to future rollout logs | Low | Backend | Step 15 closeout |

