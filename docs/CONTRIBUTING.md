# Contributing

We welcome contributions from the community! Whether you're fixing bugs, adding new features, or improving documentation, your help is greatly appreciated. Please follow the guidelines below to ensure a smooth contribution process.

## Setting up your development environment

1. Make sure you have Git installed on your machine and have set it up with LF line endings:

```bash
git config --global core.autocrlf input
```

This command ensures that on checkout files use LF line endings. Otherwise, you will face errors while trying to commit your changes on Windows machines.

2. Fork the repository on GitHub.
3. Clone your forked repository to your local machine.

```bash
git clone --recurse-submodules <your-forked-repo-url>
```

4. Make sure you have Bun and suggested extensions (if using VS Code) installed on your local machine.
5. Install the project dependencies by running:

```bash
bun i
```

6. Generate the Lua bundle that Configurator will use:

```bash
bun run sync -p .
```

## Making changes

### Game tweaks

We aim to keep the game tweaks organized, easy to manage and appealing to broad audience. If you are planning to alter existing tweaks or add new ones, please discuss them in the Issues section or in BAR Discord server (#modding-discussion/NuttyB Mod Discussion thread) before starting your work. This helps to avoid duplication of efforts and ensures that your contributions align with the project's vision.

The source code of the tweaks is located in the `lua` folder. There are two types of tweaks: `tweakunits` (simple Lua tables that define unit data) and `tweakdefs` (more complex ones that are defined as a proper Lua code). Please refer to existing tweaks for examples of how to structure your code and BAR documentation on that topic.

The configurator options are defined in `src/lib/command-generator/data/configuration.ts`. Adding a new one should be straightforward.

The tweaks are mapped to the options in `src/lib/command-generator/data/configuration-mapping.ts` in `CONFIGURATION_MAPPING`. As ordering of tweaks matters, pay close attention to `LUA_PRIORITIES` constant that defines the loading order. You may also want to update the configurator UI in `src/components/tabs/configurator/sections`.

To see your changes in action, run the sync script and spin up the development server:

```bash
bun run sync -p .
bun dev
```

Please note the following:

- Make sure that your tweak files are named semantically, so it is clear what each tweak does judging by its filename.
- At the top of your tweak file add a **single-line** comment describing what your tweak does.
- Wrap your `tweakdefs` code in `do ... end` block so that the local variables do not pollute the global namespace. It is **critical** for proper tweak merging to work.
- Take time to read the existing code. There is a good chance that it can inspire you or help you avoid pitfalls.

### The configurator web UI

The source code of the configurator web UI is located in the `src` folder. It is a Next.js app powered by Mantine component library. If you are not familiar with these technologies, please refer to their documentation.

When making changes to the UI, please ensure that your code adheres to the existing coding style and conventions. Consistency is key to maintaining a clean and readable codebase.

- Please use Mantine components wherever possible to ensure a consistent look and feel.
- Avoid using inline styles. Instead, use Mantine's props.
- Follow the existing folder structure and naming conventions.
- Avoid code duplication by reusing existing components and utilities.
- Try to make your components modular and reusable. If you find your component growing too large, consider breaking it down into smaller sub-components.
- Try to extract business logic out of the components into separate utility functions or hooks.
- In general, strive to write clean, maintainable and well-documented code and follow best practices.

## Submitting your changes

1. Before submitting your changes, make sure to run the tests to ensure everything is working correctly:

```bash
bun test
```

2. Update the changelog. The root `CHANGELOG.md` is grouped by date (newest first) and is shown both on GitHub and on the configurator's About page. You can scaffold a draft section from commits made since the latest recorded date:

```bash
bun run changelog-draft
```

This inserts a new dated section with a bullet list. Trim out internal-only changes and tidy the wording before committing. Use `--dry-run` to preview without writing.

3. Commit your changes with a descriptive commit message.
4. Push your changes to your forked repository.
5. Open a pull request (PR) against the origin repository. Please provide a clear description of the changes you have made and any relevant context.

### Deployment (GitHub Pages)

Deployment is automated using GitHub Actions. Pushes to the `main` branch will trigger a build and deploy the site to GitHub Pages. By default, it uses the repository name to define the base path for the web application. If you want to use a custom base path, you can set the `BASE_PATH` repository variable in your repository settings. Note that you should not include a leading slash in the `BASE_PATH` value.
