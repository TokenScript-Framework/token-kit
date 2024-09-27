# @token-kit/cli

A CLI for adding token-kit ui components to your project.

## Usage

Use the `init` command to initialize dependencies for a new project.

The `init` command installs dependencies, adds the `cn` util, configures `tailwind.config.js`, and CSS variables for the project.

```bash
npx @token-kit/cli init
```

## add

Use the `add` command to add components to your project.

The `add` command adds a component to your project and installs all required dependencies.

```bash
npx @token-kit/cli add [component]
```

### Example

```bash
npx @token-kit/cli add token-card
```

You can also run the command without any arguments to view a list of all available components:

```bash
npx @token-kit/cli add
```
