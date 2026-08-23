/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  outputFileTracingIncludes: {
    '/**/*': ['./club.db'],
  },
};

export default nextConfig;
