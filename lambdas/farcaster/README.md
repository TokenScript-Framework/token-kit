# @token-kit/farcaster-lambda

This is the lambda function that generates the farcaster frame for the token.

We expect your website to be hosted on AWS S3 with cloudfront in front.

## Usage

```sh
pnpm i
pnpm build
pnpm package
```

This will generate a `token-kit-farcaster-lambda.zip` file that can be uploaded to AWS Lambda.

Please note you should use `us-east-1` region for Lambda@Edge.

Full documentation can be found in [OG - TokenKit](https://token-kit.vercel.app/docs/lambdas/farcaster).
