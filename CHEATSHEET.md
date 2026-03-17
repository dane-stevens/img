# Image Transformation Cheat Sheet (`o=` Tokens)

Use these tokens in the `o=` query parameter to apply transformations.

---

## Resize & Dimensions

| Token      | Description                           | Example         |
|------------|---------------------------------------|----------------|
| `w-<px>`   | Set width in px or preset size        | `w-400`        |
| `h-<px>`   | Set height in px or preset size       | `h-300`        |
| `size-<preset>` | Set width & height simultaneously | `size-md`      |
| `fit-<type>` | Resize fit: `cover` or `contain`    | `fit-cover`    |

**Presets**: `3xs, 2xs, xs, sm, md, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl, 7xl`

---

## Filters & Adjustments

| Token       | Description                          | Example       |
|------------|--------------------------------------|---------------|
| `blur-<n>` | Gaussian blur                         | `blur-5`      |
| `rotate-<deg>` | Rotate image                       | `rotate-90`   |
| `quality-<1-100>` | Output quality                   | `quality-80`  |
| `grayscale` | Convert to grayscale                  | `grayscale`   |
| `flip`      | Flip vertically                        | `flip`        |
| `flop`      | Flip horizontally                      | `flop`        |
| `negate`    | Invert colors                           | `negate`      |
| `normalize` | Normalize colors                        | `normalize`   |
| `clahe-<n>` | Apply CLAHE enhancement                | `clahe-8`     |
| `threshold-<n>` | Thresholding                        | `threshold-128` |

---

## Crop, Trim & Extend

| Token         | Description                             | Example                  |
|---------------|-----------------------------------------|--------------------------|
| `trim`        | Remove background                        | `trim` or `trim-white`  |
| `extend-<n>`  | Extend edges in px                        | `extend-20`              |
| `extract-<l,t,w,h>` | Crop area: left,top,width,height   | `extract-10,20,200,100` |
| `bg-<color>`  | Set background color when extending       | `bg-blue`                |
| `tint-<color>` | Apply color tint                         | `tint-red`               |

**Colors:** `white, black, red, green, blue` (and custom via your `colors.js`)

---

## Advanced Effects

| Token       | Description                         | Example     |
|------------|-------------------------------------|------------|
| `dilate`   | Dilate filter                        | `dilate`   |
| `erode`    | Erode filter                          | `erode`    |
| `flatten`  | Flatten alpha channel                 | `flatten`  |
| `unflatten`| Unflatten alpha channel               | `unflatten`|

---

## Output Formats

| Token      | Description                           | Example       |
|------------|---------------------------------------|---------------|
| `jpeg`     | Output as JPEG                        | `jpeg`        |
| `png`      | Output as PNG                          | `png`         |
| `webp`     | Output as WebP                         | `webp`        |
| `avif`     | Output as AVIF                         | `avif`        |

> ⚠️ Default format is chosen based on the `Accept` header if none is specified.

---

## Example Combined Transformations

```http
/img?u=https://example.com/img.jpg&o=w-800_h-600_blur-3_grayscale_webp
/img?u=https://example.com/img.jpg&o=rotate-90_flip_quality-90
/img?u=https://example.com/img.jpg&o=extract-10,20,200,100_extend-10_bg-black
