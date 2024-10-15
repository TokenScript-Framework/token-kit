# Common Api Backend

> Note:
>
> This file is only the readme of key information, not a verbose one. Because:
>
> 1. We try to follow `code as the document` style
> 1. All documents can be generated from code automatically, as a dev, you won't need to worry about the inconsistence between `interface document` and `code`.

## Workflow

1. Apply for your api key for each project
   - one `api key` for one project.
   - `post` to `/projects`
1. Create a config for the project.
   - `put` to `projects/:id`, see `configSchema` in [the "projects" schema](./src/services/projectService.ts).
1. Call apis with `apiKey`

## Interfaces

- [DB Schema](./src/schemas/)
- [Enviroment Variables](./src/env.ts)
- [API Endpoints & JWT Security Rules](./src/controllers.ts)
- To see swagger documents:
  - `npm start`
  - The link: http://127.0.0.1:3006/documentation

## How to code

There is a simple framework in this code base, see [how to develop](./README-for-Dev.md)

## Deployment

Single instance for this repo.

## Don't Miss This!

### Using Api Key as the index of the project configuration

The `apiKey` in each request will be the index of the project configuration, so make sure the project is configured correctly before invocation.

### Async Queue

For each external apis required calling, the request will go to a internal task queue at first. Then each task will be called by a cron job.

So, for those called expecting the results, call the api with a `callback` url. It will be called by common apis when the result is ready.

The reasons why we design like this:

- Making sure every request can be executed once and only once.
- Avoid duplicated requests being sent to the extenal apis.
  - Currently, achive this by deploying a single instance for this repo.

### Encrypted Ticket Issuer Private Key

The `Ticket Issuer Private Key` will be encrypted before saving in DB. So, using configuration api to config it, not by a insert sql!

