# @token-kit/tapp-snap-sdk

This sdk is for Tapp Snap, you can use it to import your token into Tapp Snap.

## Installation

To install:

```shell
pnpm add @token-kit/tapp-snap-sdk

npm install @token-kit/tapp-snap-sdk
```

## Key Features

- Easy integration with Tapp Snap
- Simplified API for import token

## Usage

This sdk exports `ImportButton` for Tapp Snap, you can use it to import your token into Tapp Snap:

```typescript
import { ImportButton } from '@token-kit/tapp-snap-sdk';


const [status, setStatus] = useState<string | null>(null);
const [error, setError] = useState<string | null>(null);
  

const handleSuccess = () => {
    setStatus('Imported successfully!');
    setError(null);
};

const handleError = (error1: Error) => {
    setError(error1.message);
    setStatus(null);
};

<ImportButton
    chain="11155111"
    contract="0x*****"
    tokenId="1"
    title="Import"
    cssClass="your own tailwind css"
    onSuccess={handleSuccess}
    onError={handleError}
    />

{status && (
    <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
    {status}
    </div>
)}

{error && (
    <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
    Error: {error}
    </div>
)}
```

### Change SnapId

By default, the snap Id is  'npm:@token-kit/tapp-snap', if you want to use other test snap Id, you can copy `.env.example` and  change it's name to `.env`. You can set `NEXT_PUBLIC_TAPP_SNAP_ID` in `.env`.

### Using MetaMaskSnapButton

This sdk also exports `MetaMaskSnapButton` for request other snaps, you can use it to revoke any snaps:

```typescript
<MetaMaskSnapButton
    snapId={your_snap_Id}
    snapMethod={your_snap_method}
    snapParams={your_snap_params}
    title={title}
    cssClass={your_css_class}
    onSnapInstalled={your_snap_installed_handler}
    onSuccess={your_success_handler}
    onError={your_error_handler}
/>
```
