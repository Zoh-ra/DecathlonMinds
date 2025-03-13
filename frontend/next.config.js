/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'images.unsplash.com',
      'source.unsplash.com',
      'plus.unsplash.com',
      'randomuser.me',
      'picsum.photos',
      'loremflickr.com',
      'cloudinary.com'
    ],
  }
};

module.exports = nextConfig;
