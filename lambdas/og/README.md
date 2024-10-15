# @token-kit/og-lambda

This is the lambda function that generates the Open Graph image for the token.

## Usage

```sh
pnpm i
pnpm build
pnpm package
```

This will generate a `token-kit-og-lambda.zip` file that can be uploaded to AWS Lambda.

Please note you should use `us-east-1` region for Lambda@Edge.

Full documentation can be found in [OG - TokenKit](https://token-kit.vercel.app/docs/lambdas/og).
