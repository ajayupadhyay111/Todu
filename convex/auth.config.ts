// Validates Clerk JWTs server-side. Set CLERK_JWT_ISSUER_DOMAIN in the
// Convex dashboard (Clerk Frontend API URL, e.g. https://xxx.clerk.accounts.dev).
// See https://docs.convex.dev/auth/clerk
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex",
    },
  ],
};
