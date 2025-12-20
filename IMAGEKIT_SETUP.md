# ImageKit Integration Setup

## Environment Variables

Add these to your `.env` file:

```env
IMAGEKIT_PUBLIC_KEY=public_GUi4rT/ow9ZUWxoxtT8idACUVXo=
IMAGEKIT_PRIVATE_KEY=your_private_key_here
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/4paezevxw
```

**Note:** You need to get your private key from ImageKit dashboard. The public key is already configured.

## API Endpoints

### 1. Get Authentication Token
`GET /api/imagekit/auth`
- Returns authentication parameters for client-side ImageKit uploads

### 2. Upload Image
`POST /api/imagekit/upload`
- Uploads an image to ImageKit
- Form data:
  - `file`: The image file
  - `folder`: (optional) Folder path in ImageKit (default: "/menu")

## Usage

### In Components

Use the `OptimizedImage` component for automatic image optimization:

```tsx
import OptimizedImage from "@/components/OptimizedImage";

<OptimizedImage
  src="https://ik.imagekit.io/4paezevxw/menu/item.jpg"
  alt="Menu Item"
  width={400}
  height={300}
  quality={85}
/>
```

### Manual URL Transformation

```tsx
import { getOptimizedImageUrl } from "@/utils/imagekit-utils";

const optimizedUrl = getOptimizedImageUrl(imageUrl, {
  width: 400,
  height: 300,
  quality: 85,
  format: "auto"
});
```

## Features

- ✅ Automatic image optimization
- ✅ Format conversion (WebP, etc.)
- ✅ Quality control
- ✅ Responsive image sizing
- ✅ Lazy loading support

