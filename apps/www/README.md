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

2. Create a new file in `apps/www/registry/default/ui/my-component.tsx`

3. Add a new entry to `apps/www/registry/default/ui/index.tsx`

```ts
export { MyComponent } from "./my-component";
```

4. Add a doc file in `apps/www/content/docs/components/my-component.mdx`

Can take other files as an example.
Now the page should be working.

5. Add the component to the registry under `apps/www/registry/registry-ui.ts`

```ts
{
  name: "my-component",
  type: "registry:ui",
  files: ["ui/my-component.tsx"],
  dependencies: [],
},
```

6. Add the example to the registry under `apps/www/registry/registry-examples.ts`

```
  {
    name: "my-component-demo",
    type: "registry:example",
    registryDependencies: ["my-component"],
    files: ["example/my-component-demo.tsx"],
  }
```

then `npm run build:registry` to generate the registry files.

6. Implement your component under `apps/www/registry/default/ui/my-component.tsx`

7. Implement your preview demo under `apps/www/registry/default/examples/my-component-demo.tsx`
