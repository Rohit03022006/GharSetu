# GharSetu — Complete Load, Stress, Capacity & Scalability Test

Perform a complete **performance, load, stress, spike, endurance, and capacity assessment** of the GharSetu application.

The goal is to determine:

> **How much real traffic can GharSetu handle before latency, errors, database connections, CPU, memory, Redis, or other infrastructure becomes a bottleneck?**

Do NOT estimate capacity from code alone.

Use actual load tests against the running application.

---

# 1. APPLICATION ARCHITECTURE

Test the complete architecture:

```text
Internet
   ↓
React Frontend
   ↓
API Gateway :4000
   ↓
Identity Service :4001
Finance Service :4002
Listing Service :4003
Preference Service :4004
Discovery Service :4005
Engagement Service :4006
Analytics Service :4007
   ↓
PostgreSQL
Redis
MinIO
```

Use the actual ports/configuration found in the project rather than blindly assuming these values.

---

# 2. FIRST — INSPECT THE INFRASTRUCTURE

Before load testing, inspect:

* Docker Compose
* CPU configuration
* Memory configuration
* PostgreSQL configuration
* Connection pool sizes
* Redis configuration
* MinIO configuration
* Node.js process configuration
* API Gateway configuration
* Rate limits
* Worker processes
* Logging configuration
* Existing caching
* Database indexes
* Existing performance tests

Document the current environment.

Example:

```text
Environment
CPU:
RAM:
Node version:
PostgreSQL:
Redis:
MinIO:
Docker:
Database connection pool:
API Gateway:
```

---

# 3. DO NOT TEST PRODUCTION

Never run destructive/high-load tests against production unless explicitly authorized.

Use:

```text
Local
or
Dedicated staging environment
```

The test environment should resemble production as closely as possible.

---

# 4. CREATE A REALISTIC TEST DATASET

Do not load test with only 5 database records.

Create a realistic dataset.

Target at least:

```text
Users:
10,000+

Properties:
50,000+

Property images:
100,000+

Bookings:
100,000+

Reviews:
100,000+

Wishlist records:
100,000+

Search history:
500,000+

Recently viewed:
500,000+

Leads:
100,000+
```

Adjust numbers according to database/resource availability.

Do not destroy existing development data.

Create a dedicated load-test dataset or database.

---

# 5. TESTING TOOL

Use a proper load-testing tool.

Prefer one of:

```text
k6
Artillery
JMeter
```

Prefer **k6** if there is no existing load-testing framework.

Do not write a simple script that sends a few HTTP requests and call that a load test.

---

# 6. DEFINE KEY PERFORMANCE METRICS

Measure at minimum:

### Request metrics

* Requests/sec
* Requests/min
* Total requests
* Successful requests
* Failed requests
* HTTP status distribution

### Latency

Measure:

```text
P50
P75
P90
P95
P99
Max
```

Do not report only average latency.

### Infrastructure

Measure:

* CPU %
* RAM
* Node.js heap
* Event loop lag
* PostgreSQL CPU
* PostgreSQL RAM
* DB connections
* Slow queries
* Lock waits
* Transaction duration
* Redis memory
* Redis CPU
* Redis hit/miss if applicable
* MinIO throughput
* Network throughput

---

# 7. DEFINE SUCCESS CRITERIA

Use initial targets such as:

```text
P95 API latency < 500ms
P99 API latency < 1000ms
Error rate < 1%
HTTP 5xx < 0.1%
No data corruption
No duplicate bookings
No unauthorized data access
No memory leak
No connection pool exhaustion
```

If the architecture/documentation has stricter requirements, use those instead.

Do not change the thresholds simply because the application fails them.

---

# 8. BASELINE TEST

First run a low-load baseline.

Example:

```text
10 concurrent users
5 minutes
```

Measure:

* Latency
* Throughput
* Errors
* CPU
* RAM
* DB connections
* Redis
* Event loop

This establishes the normal performance baseline.

---

# 9. LOAD TEST

Run gradually increasing traffic.

Example:

```text
10 users
25 users
50 users
100 users
250 users
500 users
1,000 users
2,500 users
5,000 users
10,000 users
```

Do NOT assume the infrastructure can safely reach 10,000 concurrent users.

Stop or reduce the test if the environment becomes unstable.

For each level record:

```text
Concurrent users
Requests/sec
P50
P95
P99
Error %
CPU
RAM
DB connections
```

---

# 10. FIND THE BREAKING POINT

The most important result is:

> **Maximum sustainable concurrent users before SLA failure.**

Determine:

```text
Safe Capacity
Warning Capacity
Breaking Point
```

Example:

```text
Safe:
500 concurrent users

Warning:
1,000 concurrent users

Breaking:
1,800 concurrent users
```

Do not invent these values.

They must come from actual testing.

---

# 11. RAMP TEST

Use gradual traffic growth.

Example:

```text
0 → 50 → 100 → 250 → 500 → 1,000
```

Hold each level long enough to observe system behavior.

Look for:

* Latency growth
* Queue buildup
* CPU saturation
* DB saturation
* Connection exhaustion
* Redis slowdown
* Garbage collection
* Event loop lag

---

# 12. SPIKE TEST

Simulate sudden traffic.

Example:

```text
100 users
↓
2,000 users within 30 seconds
```

Measure:

* Error rate
* Recovery time
* P95/P99 latency
* CPU spike
* Memory spike
* DB connection spike

Determine whether the application:

* Survives
* Degrades gracefully
* Recovers automatically
* Crashes

---

# 13. STRESS TEST

Gradually increase traffic beyond normal capacity.

Continue until a clear bottleneck appears.

Find whether the first limitation is:

```text
API Gateway
Node.js
CPU
Memory
PostgreSQL
DB connections
Redis
MinIO
Network
```

Do not simply report "server overloaded."

Identify the actual bottleneck.

---

# 14. SOAK / ENDURANCE TEST

Run a realistic load for a long duration.

Example:

```text
30–50% of measured maximum capacity
for 2–4 hours
```

Check for:

* Memory leaks
* Connection leaks
* Growing latency
* Growing DB connections
* Redis memory growth
* Unhandled promise rejections
* Node process instability
* Increasing error rate

If resources gradually increase without returning to baseline, investigate.

---

# 15. FRONTEND PERFORMANCE

Do not only test APIs.

Measure frontend performance for important screens:

* Home/Search
* Property Detail
* Login
* Buyer Dashboard
* Property Editor
* Admin Dashboard

Measure:

```text
FCP
LCP
CLS
INP
TTFB
JS bundle size
Initial page load
API waterfall
```

Identify:

* Large bundles
* Large images
* Excessive API calls
* Duplicate requests
* Slow rendering
* Unnecessary rerenders

---

# 16. SEARCH LOAD TEST

Search is likely one of the highest-traffic endpoints.

Test:

```text
GET /properties
```

with realistic combinations of:

* Location
* Price
* Property type
* BHK
* Sort
* Pagination

Measure performance with:

```text
10,000
50,000
100,000+
```

properties.

Check PostgreSQL query plans.

Identify missing indexes.

---

# 17. PROPERTY DETAIL LOAD TEST

Test:

```text
GET /properties/:id
```

under high traffic.

Simulate popular-property traffic where many users request the same property simultaneously.

Measure:

* DB load
* Redis cache effectiveness
* P95/P99
* Throughput

Determine whether caching is working.

---

# 18. AUTHENTICATION LOAD TEST

Test:

* Login
* Registration
* OTP request
* OTP verification
* Token refresh

Do not abuse real email/SMS providers.

Use a test provider/mock infrastructure for OTP delivery while testing.

Measure:

* Requests/sec
* Auth latency
* DB load
* Rate limiter behavior

Verify rate limiting remains functional under load.

---

# 19. BOOKING LOAD TEST

This is a critical test.

Simulate many users booking different slots.

Then simulate:

```text
100 users
↓
same property
↓
same availability slot
```

Expected:

```text
Exactly one successful booking
Others receive conflict
No duplicate booking
No inconsistent availability
No database corruption
```

This must remain true under concurrency.

---

# 20. BOOKING THROUGHPUT

Test normal booking traffic.

Example:

```text
10 bookings/sec
25 bookings/sec
50 bookings/sec
100 bookings/sec
```

Find the maximum sustainable booking throughput.

Measure:

* DB locks
* Transaction duration
* Connection pool
* Error rate
* P95/P99

---

# 21. WISHLIST LOAD

Test:

* Fetch wishlist
* Add
* Remove

with many concurrent users.

Check:

* Database contention
* Duplicate records
* Unique constraints
* API latency

---

# 22. REVIEW LOAD

Test:

* Fetch reviews
* Create reviews
* Moderation

Simulate concurrent review creation.

Verify:

* Eligibility rules remain enforced
* No duplicate reviews if prohibited
* Database consistency

---

# 23. LEADS LOAD

Test broker/builder lead traffic.

Simulate:

* Fetch leads
* Move lead stage
* Multiple users modifying leads
* Analytics updates

Check concurrency and database locks.

---

# 24. ANALYTICS LOAD

Analytics can be high volume.

Generate realistic event traffic:

```text
Property view
Search
Wishlist
Compare
Booking
Review
Lead
```

Test:

```text
100 events/sec
500 events/sec
1,000 events/sec
5,000 events/sec
```

until the infrastructure limit is found.

Measure:

* Redis Pub/Sub
* Analytics ingestion
* Database writes
* Aggregation latency
* Duplicate event handling

Verify idempotency remains correct under load.

---

# 25. REDIS PERFORMANCE

Measure:

* Commands/sec
* Memory
* Hit ratio
* Latency
* Pub/Sub throughput
* Connection count

Check whether Redis becomes the bottleneck.

---

# 26. POSTGRESQL PERFORMANCE

This is critical.

Measure:

* Queries/sec
* Active connections
* Waiting connections
* Slow queries
* Lock waits
* CPU
* Memory
* Disk I/O

Use:

```sql
EXPLAIN ANALYZE
```

for important slow queries.

Inspect indexes for:

* Properties
* Search
* Bookings
* Availability
* Reviews
* Wishlist
* Leads
* Analytics

Do not add indexes blindly.

Add indexes based on actual query patterns.

---

# 27. CONNECTION POOL TEST

Determine:

```text
Maximum DB connections
Current pool size
Connection wait time
Connection exhaustion point
```

Find whether Node.js services exhaust PostgreSQL connections under concurrency.

---

# 28. MINIO LOAD

Test realistic image/document workloads.

Measure:

* Upload throughput
* Download throughput
* Concurrent uploads
* Concurrent downloads
* Object retrieval latency

Do not test with production/private documents.

Use generated test files.

---

# 29. API GATEWAY CAPACITY

Determine gateway limits.

Measure:

* Requests/sec
* CPU
* Memory
* Proxy latency
* Connection count
* Rate limiter performance

Compare:

```text
Direct service latency
vs
Gateway latency
```

Find gateway overhead.

---

# 30. RATE LIMIT TEST

Verify that rate limits work.

Example:

```text
Normal:
Allowed

Abuse:
429 Too Many Requests
```

Ensure the rate limiter itself does not become a bottleneck.

---

# 31. ERROR RECOVERY

During load testing deliberately test:

* Restart one service
* Restart Redis
* Restart PostgreSQL test environment
* Temporarily stop Analytics Service

Measure:

* Error behavior
* Recovery
* Retry behavior
* Data consistency

Do not perform destructive tests on production.

---

# 32. HORIZONTAL SCALING TEST

If Docker/Kubernetes/environment permits, test:

```text
1 API instance
2 API instances
4 API instances
```

Determine whether performance scales.

Do the same for the most CPU-heavy services if practical.

Check for:

* Shared state
* Sticky sessions
* Redis dependence
* Database bottlenecks

---

# 33. CAPACITY CALCULATION

After actual testing, estimate realistic capacity.

Calculate:

### Concurrent users

How many simultaneous active users can the system handle while meeting SLA?

### Requests/sec

Maximum sustainable API throughput.

### Daily users

Estimate using measured sustainable request throughput and a realistic traffic pattern.

### Peak traffic

Estimate safe peak requests/sec.

Do not directly convert:

```text
1,000 concurrent users = 1,000 requests/sec
```

That assumption is incorrect.

Use realistic user behavior.

---

# 34. TRAFFIC MODEL

Create realistic user scenarios.

Example:

### Guest

```text
Home
→ Search
→ Property detail
→ Similar properties
```

### Buyer

```text
Login
→ Search
→ Property detail
→ Wishlist
→ Booking
→ Dashboard
```

### Broker

```text
Login
→ Dashboard
→ Properties
→ Leads
→ Availability
```

### Admin

```text
Login
→ Dashboard
→ Verification
→ Moderation
→ Analytics
```

Assign realistic traffic percentages.

Example:

```text
Guest: 60%
Buyer: 30%
Broker/Builder: 8%
Admin: 2%
```

Adjust based on actual expected usage.

---

# 35. TEST REALISTIC REQUEST MIX

Do not test every endpoint equally.

Use a weighted traffic model.

Example:

```text
Search: 35%
Property Detail: 30%
Auth: 5%
Wishlist: 5%
Bookings: 5%
Reviews: 3%
Dashboard: 5%
Analytics: 5%
Other: 7%
```

These are starting assumptions only.

Adjust them based on product analytics/expected traffic.

---

# 36. PERFORMANCE BUDGET

Define targets:

| Endpoint Type   | P95 Target | P99 Target |
| --------------- | ---------: | ---------: |
| Search          |    < 500ms |       < 1s |
| Property Detail |    < 400ms |    < 800ms |
| Auth            |    < 500ms |       < 1s |
| Wishlist        |    < 400ms |    < 800ms |
| Booking         |    < 500ms |       < 1s |
| Reviews         |    < 500ms |       < 1s |
| Dashboard       |    < 800ms |     < 1.5s |

Use the project's documented SLA if one exists instead.

---

# 37. FIND THE BOTTLENECK

The final result must identify the first bottleneck.

Example:

```text
1st bottleneck:
PostgreSQL CPU at 82%

2nd:
DB connection pool saturation

3rd:
Listing Service CPU

Not bottleneck:
Redis
API Gateway
MinIO
```

Do not guess.

Use measured data.

---

# 38. CAPACITY REPORT

Produce a final table:

| Metric                               | Result |
| ------------------------------------ | -----: |
| Maximum sustainable concurrent users |        |
| Safe concurrent users                |        |
| Maximum sustainable RPS              |        |
| Peak tested RPS                      |        |
| P95 latency                          |        |
| P99 latency                          |        |
| Error rate                           |        |
| PostgreSQL max CPU                   |        |
| Redis max memory                     |        |
| Node max CPU                         |        |
| Node max RAM                         |        |
| First bottleneck                     |        |
| Breaking point                       |        |

---

# 39. CAPACITY TIERS

Give three practical capacity levels.

### SAFE

Traffic that can run continuously while meeting SLA.

### WARNING

Traffic where monitoring/scaling should be triggered.

### BREAKING

Traffic where SLA starts failing.

Example format:

```text
SAFE:
X concurrent users
Y RPS

WARNING:
X concurrent users
Y RPS

BREAKING:
X concurrent users
Y RPS
```

Use actual measured values.

---

# 40. SCALING RECOMMENDATIONS

Based on actual bottlenecks, recommend:

* Vertical scaling
* Horizontal scaling
* PostgreSQL optimization
* Connection pool tuning
* Redis scaling
* Cache improvements
* Queue/background processing
* CDN
* Object storage optimization
* Read replicas
* Database partitioning if genuinely needed

Do not recommend expensive infrastructure without evidence.

---

# 41. NO FAKE CAPACITY CLAIMS

This is mandatory.

Never say:

> "GharSetu can handle 100,000 users."

unless actual testing supports it.

Instead say:

> "Under the tested environment and traffic model, the application sustained X concurrent users at Y RPS with P95 latency of Z ms and error rate of N%."

Always include:

* Hardware
* Docker configuration
* Dataset size
* Test duration
* Traffic model
* Test tool
* Test version/date

---

# 42. FINAL PERFORMANCE REPORT

Return:

## Executive Summary

* Safe concurrent users
* Warning capacity
* Breaking point
* Sustainable RPS
* P95
* P99
* Error rate

## Infrastructure

CPU/RAM/database/Redis/MinIO results.

## Endpoint Performance

Top endpoints by:

* latency
* throughput
* errors

## Bottlenecks

Rank bottlenecks.

## Scaling Plan

What should be scaled first?

## Load Test Artifacts

Save:

* Load-test scripts
* Configuration
* Raw results
* Summary report
* Monitoring output

Keep everything reproducible.

---

# FINAL VERDICT

Use:

```text
CAPACITY STATUS: NOT MEASURED
```

if meaningful load testing could not be completed.

Use:

```text
CAPACITY STATUS: BASELINE ESTABLISHED
```

if only low-load tests passed.

Use:

```text
CAPACITY STATUS: LOAD TESTED
```

if realistic load/stress tests were completed.

Use:

```text
CAPACITY STATUS: PRODUCTION CAPACITY VERIFIED
```

only if the system was tested under a production-like environment, realistic dataset, realistic traffic model, and sustained load with acceptable SLA.

---

# NON-NEGOTIABLE RULE

Do not give me a theoretical capacity number.

**Actually run the load tests.**

The final answer must tell me:

> **"At X concurrent users and Y requests/sec, GharSetu remained within the defined SLA. At Z concurrent users, the first bottleneck appeared in ______."**

Start by inspecting the current infrastructure and creating a reproducible load-testing setup. Then run baseline → load → stress → spike → soak tests and produce the final capacity report.

