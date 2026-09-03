# Route inventory

Phase 9 implements only the eight Education web routes called out below. Every other entry remains metadata and a directory reservation with no executable page, screen, handler, or navigation renderer.

## Implemented Education preview routes (8)

1. `/education`
2. `/education/setup`
3. `/education/courses`
4. `/education/assignments`
5. `/education/exams`
6. `/education/grades`
7. `/education/attendance`
8. `/education/study-sessions`

These URLs share the Education provider and local navigation. They are a volatile local preview, not production routes.

## Web routes (33)

1. `/sign-in`
2. `/recover-password`
3. `/update-password`
4. `/today`
5. `/education` (implemented preview)
6. `/education/courses` (implemented preview)
7. `/education/assignments` (implemented preview)
8. `/education/exams` (implemented preview)
9. `/education/grades` (implemented preview)
10. `/education/attendance` (implemented preview)
11. `/education/study` (superseded in the preview by `/education/study-sessions`)
12. `/health`
13. `/health/measurements`
14. `/health/sleep`
15. `/health/nutrition`
16. `/health/workouts`
17. `/health/running`
18. `/health/recovery`
19. `/finance`
20. `/finance/accounts`
21. `/finance/transactions`
22. `/finance/budgets`
23. `/finance/net-worth`
24. `/finance/investments`
25. `/finance/loans`
26. `/finance/taxes`
27. `/calculators`
28. `/calculators/[calculatorId]`
29. `/settings`
30. `/settings/profile`
31. `/settings/security`
32. `/settings/data`
33. `/settings/integrations`

The `apps/web/src/app/api` directories also reserve future internal boundaries for auth, export, restore, account, and integrations. They are not public route claims and contain no handlers.

## Mobile routes (9)

1. `/sign-in`
2. `/recover-password`
3. `/update-password`
4. `/today`
5. `/education`
6. `/health`
7. `/finance`
8. `/calculators`
9. `/settings`
