# @token-kit/tapp-snap

This is a MetaMask Snap for tapp token.

## Features

This project uses `@metamask/snaps-sdk` to develop the Snap. The features are:

- Display Token metadata, including images, attributes, and descriptions
- Provide Token-related interactive operations
- Support for multiple chains and contracts
- Build user interface using React JSX syntax

## Project Structure

- `src/`: Source code directory
  - `components/`: React components
    - `Actions.tsx`: Button Action page component
    - `HomePage.tsx`: HomePage page component
    - `TokenPage.tsx`: Interactive form component
  - `libs/`: Library
    - `constants.ts`: Some const
    - `types.ts`: Some types
    - `utils.ts`: Some common functions
  - `TokenPage.tsx`: Interactive form component
  - `index.tsx`: Entry file for the Snap
  - `index.test.tsx`: Test file
- `tsconfig.json`: TypeScript configuration file
- `package.json`: Project dependencies and scripts

## Setting enviroment

There are three params for env:

1. COMMON_API_ROOT: The root url for getting metadata
2. API_KEY: The api key for COMMON_API_ROOT
3. VIEWER_ROOT: The root url for token actions

You can copy `.env.example` and rename to `.env`, then set your own env params.

## Usage

1. Run `npm run install` to install dependencies
2. Use `npm run build` to build the project
3. Use `npm run start` to start the project, it will run on `http://localhost:8080`
4. Use `npm run test` to run tests

## Request snap in local

You can use `ethereum.request` to invoke this snap in local:

```typescript
await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
        snapId: 'local:http://localhost:8080',
        request: {
            method: 'import',
            params: YOUR_PARAMS,
        },
    },
});
```

The params are:

- `chain`:  ID of the blockchain network.
- `contract`: Address of the token contract.
- `tokenId`: Token ID.

## Testing

The project uses `@metamask/snaps-jest` for testing. The test file is located at `src/index.test.tsx`.
