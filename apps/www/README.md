# How to contribute

1. Add an entry to `apps/www/config/docs.ts` under `Components` section.
   for example:

```ts
{
  title: "My Component",
  href: "/docs/components/my-component",
  items: [],
},
```

Now you can see your component in the sidebar. But when you visit the page, you will see a 404 error.

2. Add a doc file in `apps/www/content/docs/components/my-component.mdx`

Now you should be able to see the doc page with url `http://localhost:3333/docs/components/my-component`

3. Create a new component in `apps/www/registry/default/ui/my-component.tsx`

4. Add a new entry to `apps/www/registry/registry-ui.ts`

```ts
{
  name: "my-component",
  type: "registry:ui",
  files: ["ui/my-component.tsx"],
  dependencies: [],
},
```

6. Add the example component to the registry under `apps/www/registry/default/example`

7. Add the example to the registry under `apps/www/registry/registry-examples.ts`

```ts
{
  name: "my-component-demo",
  type: "registry:example",
  registryDependencies: ["my-component"],
  files: ["example/my-component-demo.tsx"],
},
```

then `npm run build:registry` to generate the registry files.

6. Implement your component under `apps/www/registry/default/ui/my-component.tsx`

7. Implement your preview demo under `apps/www/registry/default/examples/my-component-demo.tsx`
