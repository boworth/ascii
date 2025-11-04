# Video Compression Guide for ASCII Background

To further optimize the video performance, you can compress the video file using these methods:

## Option 1: Online Video Compressor
Use a service like:
- https://www.videosmaller.com/
- https://clideo.com/compress-video
- https://www.freeconvert.com/video-compressor

Settings to use:
- Output format: MP4
- Resolution: 480p or 360p
- Frame rate: 15 FPS
- Bitrate: 200-500 kbps
- Quality: Low (we're converting to ASCII anyway)
- Remove audio track

## Option 2: Using FFmpeg (if you install it)

Install FFmpeg from: https://ffmpeg.org/download.html

Then run this command in PowerShell:
```bash
ffmpeg -i public/ocean-compressed.mp4 -vf "scale=480:270,fps=15" -b:v 300k -c:v libx264 -preset fast -an public/ocean-ultra-compressed.mp4
```

This will:
- Scale to 480x270 resolution
- Reduce to 15 FPS
- Set bitrate to 300kbps
- Remove audio (-an)
- Use fast encoding preset

## Option 3: Using HandBrake (GUI tool)

Download HandBrake from: https://handbrake.fr/

Settings:
- Preset: "Very Fast 480p30"
- Video Tab:
  - Framerate: 15
  - Quality: RF 30-35 (higher = lower quality/smaller file)
- Audio Tab: Remove all audio tracks
- Dimensions Tab: 480x270

## Current Optimizations Applied:

1. **Reduced ASCII grid**: From 180 to 80 columns (75% less processing)
2. **Frame skipping**: Only processing every 3rd frame
3. **Local video loading**: No more network requests
4. **Reduced video dimensions**: 240x160 pixels
5. **Slower playback**: 0.3x speed
6. **Canvas optimizations**: Reusing canvas, disabled smoothing
7. **Lazy loading**: preload="metadata"

After compressing, replace the video src in `app/neon-isometric-maze.tsx`:
```javascript
src="/ocean-ultra-compressed.mp4"  // Use your compressed version
```

Target file size: Under 1MB (currently the original is likely 5-10MB+)
