# KP media library

Source masters for the website's real photos and video. Nothing in this folder is served by the website; the site uses
the copies in `public/images/` and `public/videos/`.

```
KP/
├─ originals/                     untouched files exactly as received (WhatsApp), renamed only
│   ├─ photos/
│   │   ├─ hall-banquet-tables.jpeg        round tables, dressed chairs, welcome stage
│   │   ├─ hall-stage-balloon-decor.jpeg   balloon-arch stage on marble floor
│   │   ├─ hall-stage-welcome.jpeg         "Welcome K.P. Group" stage (birthday décor)
│   │   ├─ hall-lounge-seating-1.jpeg      sofa lounge, hall behind
│   │   ├─ hall-lounge-seating-2.jpeg      sofa lounge, hall behind (second angle)
│   │   └─ hall-meeting-guests.jpeg        guests seated for a meeting
│   ├─ videos/kp-hotel-promo-reel.mp4      original reel with its original (advert) audio
│   └─ brand/kp-logo.jpeg                  logo reference (the site uses the vector public/images/brand/logo-mark.svg)
└─ enhanced/                      cleaned, sharpened, colour-graded versions
    ├─ photos/<same names>.jpg             full square frame, 2160 × 2160, for print/social/future slots
    ├─ videos/kp-banquet-hall-reel-master.mp4   high-quality master, 720 × 1280, new ambient score
    └─ audio/kp-ambient-score.m4a         the original ambient soundtrack on its own (royalty-free, made for this reel)
```

## Where each photo is on the website

| Website file (`public/images/…`) | From original | Shows up on |
|---|---|---|
| `events/grand-hall.jpg` | hall-banquet-tables | Banquets page banner, Grand Banquet Hall card, Gallery |
| `events/royal-hall.jpg` | hall-stage-balloon-decor | Royal Banquet Hall card |
| `events/mini-hall.jpg` | hall-lounge-seating-1 | Mini Hall card |
| `events/conference-hall.jpg` | hall-meeting-guests | Conference page banner, Home "Meetings" section, Gallery |
| `home/lounge.jpg` | hall-lounge-seating-2 | About page banner, Gallery "Resort lounge" |
| `offers/events.jpg` | hall-stage-welcome | "Event Booking Offer" card |

Video for the site: `public/videos/kp-banquet-hall-reel.mp4` (web size, ~15 MB) + poster `kp-banquet-hall-reel-poster.jpg`.

## What "enhanced" means
Compression-noise removal (non-local means), Lanczos upscale, two-stage sharpening, gentle warm grade that tones down the
electric-blue LEDs/pillars so the photos sit with the site's green-and-brass palette. Video: same treatment plus the
original audio replaced by a calm ambient score (tanpura-style drone, warm pads, soft bells).

Photos still needed (currently stock pictures): rooms, restaurant/dining, hotel exterior, home hero, pool, balcony,
weekend & dining offers.
