# Images — how to replace the demo pictures with your own

Every picture on the website is a plain file in this folder. **To change a picture, overwrite the file with the same name.**
No code change, no rebuild of anything else. (Developers: all names are listed in `src/config/images.ts`.)

```
public/images/
├─ brand/
│   └─ logo-mark.svg        ← the round "KP" logo (header, footer, admin, 404, emails use text)
├─ home/
│   ├─ hero.jpg             ← big photo at the top of the homepage                    (2000 × 1200)
│   ├─ hotel-exterior.jpg   ← About page photo + gallery + gallery page banner         (1600 × 1000)
│   ├─ pool.jpg             ← Contact page banner + "Plan your stay" banner             (1600 × 900)
│   ├─ pool-tropical.jpg    ← Offers page banner                                        (1600 × 900)
│   ├─ lounge.jpg           ← About page banner + gallery                               (1400 × 900)
│   └─ balcony.jpg          ← gallery                                                   (1400 × 900)
├─ rooms/                   ← photos of room types (names are typed in Admin → Rooms & rates)
│   ├─ deluxe-room-1.jpg … deluxe-room-3.jpg
│   ├─ premium-room-1.jpg … executive-suite-1.jpg … family-suite-1.jpg … twin-room-1.jpg   (3 per room)
│   └─ <your-new-room>-1.jpg                                                            (1400 × 1000)
├─ dining/   dishes.jpg · restaurant.jpg · terrace.jpg                                  (1600 × 1000)
├─ events/   grand-hall.jpg · royal-hall.jpg · mini-hall.jpg · conference-hall.jpg      (1600 × 1000)
└─ offers/   weekend.jpg · dining.jpg · events.jpg                                      (1000 × 700)
```

## Replace an existing picture
1. Make your photo the right shape (see sizes above — JPG or WebP, ideally under 400 KB).
2. Name it **exactly** like the file you are replacing (e.g. `hero.jpg`) and drop it into the same folder, overwriting the old one.
3. Refresh the browser (`Ctrl + F5`). Done.

If your file has a different extension (for example `hero.png` or `hero.webp`), tell the developer, or change that one word in `src/config/images.ts`.

## Replace the logo
Overwrite `brand/logo-mark.svg` with your logo (square; SVG or PNG — for PNG also change the path in `src/config/images.ts`
→ `brand.logoMark`). The favicon is `src/app/icon.svg`.

## Add a new room with its own photos
1. Copy your room photos here: `public/images/rooms/heritage-suite-1.jpg`, `heritage-suite-2.jpg`, …
2. In the admin console go to **Rooms & rates → Add room** and type those file names in the *Photos* section (first one is the main photo).
3. The room (with its photos) appears on the website within about 30 seconds.

## Good to know
- Some demo photos appear in several places on purpose (for example a room photo is also used in the gallery). Replacing a file replaces it everywhere it is used.
- If a file is missing, the site shows a green placeholder instead of a broken picture, so nothing breaks while you are swapping files.
- The automated test `tests/images.test.ts` fails if a name in the registry has no file, so typos are caught before release.
