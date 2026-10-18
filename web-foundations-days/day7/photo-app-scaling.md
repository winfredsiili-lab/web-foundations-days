# SnapShare Scaling Plan

SnapShare is a photo sharing app. Users upload photos and scroll a feed of photos from people they follow. This plan estimates the load, decides what kind of system it is, and designs an architecture that can handle it.

## 1. Assumptions

* 10,000,000 registered users.
* 10% of them are active each day, so daily active users (DAU) = 10,000,000 × 0.10 = **1,000,000**.
* Each active user uploads 1 photo per day.
* Each active user views 50 feed pages per day, and one feed page view is one request to the feed API.
* An average photo is 2 MB, and each photo also gets a 50 KB thumbnail.
* One day has 86,400 seconds.
* Peak traffic is 5 times the average.
* Storage uses decimal units (1 TB = 1,000,000 MB) and one year has 365 days.
* Extra assumption, used only for the bandwidth note: each feed page shows 20 thumbnails.

## 2. Estimates

### Uploads per second

* Uploads per day: 1,000,000 users × 1 photo = 1,000,000.
* Average: 1,000,000 ÷ 86,400 ≈ **11.6 uploads per second**.
* Peak: 11.6 × 5 ≈ **58 uploads per second**.

### Feed views per second

* Feed views per day: 1,000,000 users × 50 pages = 50,000,000.
* Average: 50,000,000 ÷ 86,400 ≈ **579 feed views per second**.
* Peak: 579 × 5 ≈ **2,894 feed views per second** (about 2,900).

### Photo storage per year

* Originals: 1,000,000 × 2 MB = 2,000,000 MB = 2 TB per day, and 2 TB × 365 = **730 TB per year**.
* Thumbnails: 1,000,000 × 50 KB = 50 GB per day, and 50 GB × 365 = **18.25 TB per year**.
* Total: 730 + 18.25 = **about 748 TB per year**.
* If the object storage keeps 3 copies of every file for safety, the raw disk needed is about 3 × 748 = 2,245 TB, or roughly 2.2 PB per year.

### Extra: thumbnail bandwidth

* Average: 579 views per second × 20 thumbnails × 50 KB ≈ 579 MB per second (about 4.6 Gbit per second).
* Peak: about 2.9 GB per second.
* No small set of servers can send this much data directly, which is why a CDN is essential.

| Metric | Average | Peak (5×) |
|---|---|---|
| Uploads per second | 11.6 | 58 |
| Feed views per second | 579 | 2,894 |
| Storage per year | 748 TB (730 TB originals + 18.25 TB thumbnails) | not applicable |

## 3. Read heavy or write heavy?

SnapShare is **read heavy**. There are 50,000,000 feed views but only 1,000,000 uploads per day, so there are 50 reads for every write (579 reads per second against 11.6 writes per second).

What this means for the design:

* **Cache and replicate the reads.** Popular feed data goes in a cache, and a read replica of the database answers the queries that miss the cache.
* **Serve photos from a CDN.** Most of the traffic is people downloading thumbnails and photos, so it should never reach the app servers.
* **Keep the write path simple.** About 58 writes per second at peak is easy for one primary database, so the extra effort goes into reads.
* **Do slow work later.** Making thumbnails is moved to a queue so that an upload stays fast.
* **Scale by adding servers.** App servers hold no state, so more can be added behind the load balancer when reads grow.

## 4. Why photos must not be stored inside the database

* **Size.** Originals add 2 TB every day. A database holding that would become huge, and backups, restores and replication would be very slow because the replica has to copy every byte.
* **Wrong tool.** A database is built for small structured rows that are searched and joined. Large files fill its memory cache and slow down the normal queries.
* **Cost.** Database storage is far more expensive per terabyte than object storage.
* **Delivery.** A CDN can fetch files directly from object storage, but it cannot serve files out of a database.

Instead, the photo files go in **object storage** (for example Amazon S3 or a similar service). The database stores only a small row for each photo: its id, the owner, the object storage key of the original and of the thumbnail, the status and the time. The app turns that key into a CDN address when it builds the feed.

## 5. Architecture diagram

```
                              ┌────────────────────────────┐
                              │           CLIENT           │
                              │   mobile app or browser    │
                              └──────────────┬─────────────┘
                    ┌────────────────────────┴────────────────────────┐
                    ▼ photo downloads                                 ▼ API requests
        ┌───────────────────────┐                           ┌───────────────────┐
        │          CDN          │                           │   LOAD BALANCER   │
        │  photos, thumbnails   │                           │  spreads traffic  │
        └───────────────────────┘                           └─────────┬─────────┘
                    │ cache miss                          ┌───────────┴───────────┐
                    ▼                                     ▼                       ▼
     ┌─────────────────────────────┐ file access  ┌───────────────┐       ┌───────────────┐
     │       OBJECT STORAGE        │◄─────────────┤ APP SERVER 1  │       │ APP SERVER 2  │
     │ original photos, thumbnails │              │  (stateless)  │       │  (stateless)  │
     └─────────────────────────────┘              └───────┬───────┘       └───────┬───────┘
                    ▲                                     │                       │
                    │                                     └───────────┬───────────┘
                    │                                                 │
                    │                               ┌─────────────────┼─────────────────┐
                    │                               ▼                 ▼                 ▼
                    │                        ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
                    │                        │    CACHE    │   │ PRIMARY DB  │   │    QUEUE    │
                    │                        │ (hot feeds) │   │(all writes) │   │   (jobs)    │
                    │                        └─────────────┘   └─────────────┘   └─────────────┘
                    │                                                 │ copies data     │ job
                    │                                                 ▼                 ▼
                    │                                          ┌─────────────┐   ┌─────────────┐
                    │                                          │READ REPLICA │   │   WORKER    │
                    │                                          │ (read copy) │   │(thumbnails) │
                    │                                          └─────────────┘   └──────┬──────┘
                    │                                                                   │
                    ┌───────────────────────────────────────────────────────────────────┘
                              worker reads the original, writes the thumbnail
```

How the lines connect:

* The client downloads photos and thumbnails from the CDN, and sends API requests (feed, upload) to the load balancer.
* The load balancer spreads requests over the app servers.
* The app servers read and write the cache, the primary database and the queue. Feed queries that miss the cache go to the read replica.
* The primary database copies every change to the read replica.
* The CDN pulls a file from object storage the first time it is asked for it (a cache miss).
* The worker takes jobs from the queue, reads the original from object storage and writes the thumbnail back.

## 6. What each component does

* **CDN:** it keeps copies of photos and thumbnails close to users, which fixes slow downloads and keeps most of the huge photo traffic away from our servers.
* **Load balancer:** it spreads incoming requests over many app servers and skips broken ones, which fixes a single server being overloaded or a single point of failure.
* **App servers:** they run the application logic (log in, upload, feed) and, because they keep no state, they fix the problem of growing traffic since more of them can simply be added.
* **Cache:** it keeps recently built feeds and photo details in fast memory, which fixes the database being hit by the same read thousands of times per second.
* **Primary database:** it stores the users, follows, photo records and likes in one correct place, which fixes the need for reliable and consistent data.
* **Read replica:** it is a live copy of the primary database that answers read queries, which fixes the primary being overloaded by the 50 to 1 read traffic.
* **Object storage:** it stores the large photo files cheaply and durably, which fixes the problem of 748 TB of photos per year not fitting in a database.
* **Queue:** it holds jobs such as "make a thumbnail for photo 123", which fixes slow uploads by letting the app reply immediately and do the heavy work later.
* **Worker:** it takes jobs from the queue and creates the thumbnails, which fixes the problem of image processing blocking the app servers.

## 7. Upload flow, step by step

1. The user picks a photo in the app. The app checks the file type and size and sends an upload request to the API.
2. The request goes through the load balancer to an app server, which checks that the user is logged in.
3. The app server saves a new row for the photo in the primary database with the status "processing", and returns a short lived upload address for object storage.
4. The app sends the 2 MB original straight to object storage using that address, so the big file never passes through the app servers.
5. When the upload finishes, the app tells an app server, which marks the row as "uploaded" and adds a job "make thumbnail for photo X" to the queue.
6. The app server replies to the user straight away ("upload received"), so the user does not wait for the thumbnail.
7. A worker takes the job from the queue, downloads the original from object storage, creates the 50 KB thumbnail and saves it in object storage.
8. The worker updates the photo row in the database with the thumbnail key and the status "ready".
9. The cached feeds of the followers are refreshed or expired, so the new photo appears in their feeds.
10. When a follower opens the feed, the CDN delivers the thumbnail. The first request fetches it from object storage, and later requests are served from the CDN copy.
11. If a worker crashes, the job goes back to the queue and another worker retries it. After several failures it moves to a dead letter queue for a person to inspect.

## 8. Trade offs

1. **Thumbnails are made later (queue and worker).** Uploads feel fast and the system survives bursts, but the thumbnail is not ready the instant the upload ends, so the feed may briefly show a placeholder. It also adds more parts to run and monitor.
2. **Caching feeds.** Reads become very fast and the database is protected, but followers may see a feed that is a few seconds out of date, and deciding when to clear the cache is hard to get right.
3. **Read replica.** It lets reads scale, but it copies data with a small delay, so a user might not see their own new photo from the replica straight away. The fix is to read that user's own recent data from the primary.
4. **CDN.** It gives fast downloads and removes enormous load, but it costs money for the bandwidth, and a deleted photo can stay visible in the CDN until its copy expires.
5. **Direct upload to object storage.** It keeps big files off the app servers, but the app has to manage the upload addresses and check the file afterwards, which makes the flow more complex.