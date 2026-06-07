# 🦖 Community NuttyB

Community NuttyB is a mod for BAR Raptors and Scavengers on steroids!

This is a monorepo that contains:
- The source code for various tweaks for the NuttyB mod (`lua` directory).
- The source code for Configurator web application.

## 📚 Documentation

- **[Wiki](https://wiki.nuttyb.org)** - Complete guides and documentation
- **[Changelog](https://wiki.nuttyb.org/changelog)** - Detailed version history with author attributions

## 🎮 Quick Start for Players

### Getting the Mod
Use the [Community NuttyB Configurator](https://nuttyb-community.github.io/nuttyb/) to generate your custom configuration with the tweaks you want.

## 🛠️ Development

### Prerequisites
- Install Bun.
- Clone this repository.
- Install dependencies.

```bash
bun install
```

### Run locally (live reload)

Use a Next web server with live reload for development.

```bash
bun dev
```

The app will be available at http://localhost:3000

### Sync Lua data

Whenever you make changes to the tweak source files, you need to generate the Lua bundle that Configurator will use. You can do this by running:

```bash
bun run sync -p .
```

Sync script supports pulling latest Lua files from either a local path or a GitHub repository. For more details, see the script's command-line help:

```bash
bun sync --help
```

### Verify Lua bundle

To run the tests, execute the following command:

```bash
bun test
```

### Deployment (GitHub Pages)

Deployment is automated using GitHub Actions. Pushes to the `main` branch will trigger a build and deploy the site to GitHub Pages. By default, it uses the repository name to define the base path for the web application. If you want to use a custom base path, you can set the `BASE_PATH` repository variable in your repository settings. Note that you should not include a leading slash in the `BASE_PATH` value.

## 👥 Contributors

This project has been made possible by the contributions of:

- [Backbash](https://github.com/Backbash) - Project owner, balance changes, raptor updates, T4 air rework
- [tetrisface](https://github.com/tetrisface) - Converter, t3 eco, tooling, and extensive tweaks
- [rcorex](https://github.com/rcorex) - Raptor mechanics, spawn system, balance updates
- [Fast](https://github.com/00fast00) - Launcher rebalance, recent features
- [timuela](https://github.com/timuela) - Unit launcher range adjustments
- [Lu5ck](https://github.com/Lu5ck) - Base64 automation, LRPC rebalance review
- [autolumn](https://github.com/autolumn) - Helper commands
- [Insider](https://github.com/goldjee) - Configurator web application, CI/CD

## 📜 License

This project uses these open source licenses:

- Original NuttyB tweaks: MIT License ([LICENSE-NuttyB.md](licenses/LICENSE-NuttyB.md)).
- Configurator web application: Apache License Version 2.0 ([LICENSE-Configurator.md](licenses/LICENSE-Configurator.md)).
