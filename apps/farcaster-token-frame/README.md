# farcaster-token-frame

This is a Farcaster frame for token preview.

## Features

This project is built on [Frog Framework](https://github.com/wevm/frog), it will render a preview of token as a farcaster frame:

- Display Token image
- Provide Token-related interactive operations
- Support for multiple chains and contracts

## Project Structure

- `app/`: Source code directory
  - `api/[[...routes]]/route`: Frame route definition
  - `service/externalApi`: Library for fetching token view data
- `tsconfig.json`: TypeScript configuration file
- `package.json`: Project dependencies and scripts

## Setting enviroment

There are three params for env:

1. COMMON_API_ROOT: The root url for getting metadata
2. API_KEY: The api key for COMMON_API_ROOT
3. VIEWER_ROOT: The root url for token actions

You can copy `.env.example` and rename to `.env`, then set your own env params.

## Run

1. Run `npm run install` to install dependencies
2. Use `npm run dev` to start the dev server

## Dev console

The project includes a dev console for developer to preview the frame locally, once you start the server, it will run on `http://localhost:3000`

developer provider the following attributes in the url at the top of the console to preview the frame

- chain (path)
- contract (path)
- tokenId (optional, query string)
- scriptId (optional, query string)
