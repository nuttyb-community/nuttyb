# 🦖 Collective NuttyB

Collective NuttyB is a mod for BAR Raptors and Scavengers on steroids!

This is a monorepo that contains:
- The source code for various tweaks for the NuttyB mod (`lua` directory).
- The source code for Configurator web application.

## 📚 Documentation

- **[Wiki](https://github.com/BAR-NuttyB-collective/NuttyB/wiki)** - Complete guides and documentation
- **[Changelog](CHANGELOG.md)** - Detailed version history with author attributions

## 🎮 Quick Start for Players

### Getting the Mod
Use the [Collective NuttyB Configurator](https://bar-nuttyb-collective.github.io/configurator/) to generate your custom configuration with the tweaks you want.

## 🛠️ Development

### Building Tweaks

Whenever you make changes to the tweak source files, you need to generate the Lua bundle that Configurator will use. You can do this by running:

```bash
bun run sync .
```

You can test that the generated bundle is sufficient by running:

```bash
bun run bundle-test
```

### Running a Local Dev Server for Configurator

To test your changes in the Configurator, you can run a local development server with:

```bash
bun run dev
```

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

See [LICENSE](LICENSE) file for details.
