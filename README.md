# Image Transformation API

A high-performance image transformation service built with **Fastify** and **Sharp**. Transform images on the fly with resizing, format conversion, color adjustments, and more.  

## Features

- Resize images to preset or custom dimensions
- Convert images to `jpeg`, `png`, `webp`, or `avif`
- Apply transformations such as blur, rotate, flip, flop, grayscale, tint, trim, extend, and extract
- Supports advanced Sharp operations like CLAHE, thresholding, and normalization
- Accepts upstream images only from allowed hosts

## Environment Variables
Comma-separated list
- ALLOWED_UPSTREAM_ORIGINS=example.com,example2.com

## API Endpoints
GET `/img?u=<IMAGE_URL>&o=<OPERATIONS>`

| Operation            | Description                                   | Example                 |
| -------------------- | --------------------------------------------- | ----------------------- |
| `w`                  | Width of the image                            | `w-400`                 |
| `h`                  | Height of the image                           | `h-300`                 |
| `size`               | Width and height simultaneously               | `size-md`               |
| `fit`                | Resize fit: `cover` or `contain`              | `fit-cover`             |
| `blur`               | Gaussian blur                                 | `blur-5`                |
| `rotate`             | Rotate in degrees                             | `rotate-90`             |
| `quality`            | Output quality (1–100)                        | `quality-80`            |
| `trim`               | Remove surrounding background color           | `trim` or `trim-white`  |
| `extend`             | Extend image edges (top, bottom, left, right) | `extend-20`             |
| `extract`            | Crop image: `left,top,width,height`           | `extract-[10,20,200,100]` |
| `tint`               | Apply color tint                              | `tint-red-600`              |
| `bg`                 | Set background color when extending           | `bg-blue-200`           |
| `grayscale`          | Convert to grayscale                          | `grayscale`             |
| `flip`               | Flip vertically                               | `flip`                  |
| `flop`               | Flip horizontally                             | `flop`                  |
| `dilate`             | Apply dilation filter                         | `dilate`                |
| `erode`              | Apply erosion filter                          | `erode`                 |
| `flatten`            | Flatten alpha channel                         | `flatten`               |
| `unflatten`          | Unflatten alpha channel                       | `unflatten`             |
| `negate`             | Invert colors                                 | `negate`                |
| `normalize`          | Normalize colors                              | `normalize`             |
| `clahe`              | Apply CLAHE enhancement                       | `clahe-8`               |
| `threshold`          | Apply thresholding                            | `threshold-128`         |
| `jpeg/png/webp/avif` | Convert output format                         | `webp`                  |

## Examples

### 1. Resize and convert to WebP:
```http
/img?u=https://example.com/picture.jpg&o=w-800_h-600_webp
```
   
### 2. Apply blur and grayscale:
```http
/img?u=https://example.com/pic.png&o=blur-3_grayscale
```

### 3. Rotate, flip, and set quality:
```http
/img?u=https://example.com/image.jpg&o=rotate-90_flip_quality-90
```

## Security & Limits

Only allows upstream images from domains listed in `ALLOWED_UPSTREAM_ORIGINS`.

Maximum upstream fetch timeout: 5 seconds.

Maximum width: 2000px (can be adjusted in MAX_WIDTH).

## License
[O'Saasy License](LICENSE.md) - Basically… the MIT do-whatever-you-want license, but with the commercial rights for SaaS reserved for the copyright holder.

