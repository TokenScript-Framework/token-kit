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
    - `HomeForm.tsx`: Home page component
    - `InteractiveForm.tsx`: Interactive form component
  - `libs/`: Library
    - `types.tsx`: Some types
    - `utils.tsx`: Some common functions
  - `InteractiveForm.tsx`: Interactive form component
  - `index.tsx`: Entry file for the Snap
  - `index.test.tsx`: Test file
- `tsconfig.json`: TypeScript configuration file
- `package.json`: Project dependencies and scripts

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
            method: 'init',
            params: YOUR_PARAMS,
        },
    },
});
```

The params are:

- `chain`:  ID of the blockchain network.
- `contract`: Address of the token contract.
- `tokenId`: Token ID.
- `owner`: Address of the token owner.
- `name`: Name of the contract.
- `description`: Description of Contract.
- `aboutUrl`: Link providing more related information for contract.
- `actions`: List of actions that can be performed on the token.
-`tokenMetadata`: Metadata containing additional information about the token, such as images, attributes, etc.

## Testing

The project uses `@metamask/snaps-jest` for testing. The test file is located at `src/index.test.tsx`.
