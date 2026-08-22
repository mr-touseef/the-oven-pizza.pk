# Background video

Place your background video files here, named exactly:

- `background.mp4` (required — H.264, served to all modern browsers)
- `background.webm` (optional — smaller file size, used when supported)

Recommendations:

- 10–20 seconds, seamlessly loop-able, no audio track needed (it is muted anyway).
- 1920×1080 or 1280×720, exported at a moderate bitrate (2–5 Mbps) so the file
  stays under a few MB — this plays on mobile data too.
- Keep the subject (food/flames) centered, since the video is cropped with
  `object-cover` on very wide and very narrow screens.

Until real files are added here, `src/components/BackgroundVideo.tsx`
automatically falls back to `public/images/hero-food.png`, so the site never
shows a broken player.
