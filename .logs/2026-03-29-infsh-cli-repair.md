# 2026-03-29 infsh CLI repair

Related issue: `RIO-21`

## Context

The tamagotchi art workflow was blocked because `infsh whoami` failed immediately on Windows with:

```text
ModuleNotFoundError: No module named 'infsh.__main__'
```

The project depended on `infsh` for Nano Banana 2 generation, so the environment-level blocker had to be resolved rather than worked around.

## Root cause

Investigation showed the local Python 3.13 install had:

- `C:\Users\datvu\AppData\Local\Programs\Python\Python313\Scripts\infsh.exe`
- `C:\Users\datvu\AppData\Local\Programs\Python\Python313\Lib\site-packages\infsh\__init__.py`
- `C:\Users\datvu\AppData\Local\Programs\Python\Python313\Lib\site-packages\inferencesh-0.6.26.dist-info\entry_points.txt`

The installed `inferencesh` wheel advertises:

```text
infsh = infsh.__main__:cli
```

but the wheel contents and installed `RECORD` contain no `infsh/__main__.py`. Downloaded wheels for `0.6.26`, `0.6.25`, `0.6.24`, `0.6.20`, `0.6.0`, `0.5.6`, and `0.4.29` showed the same mismatch, so reinstalling the PyPI package would not fix the launcher.

Official docs at `https://inference.sh/docs/extend/cli-setup` currently point to `https://cli.inference.sh`, and the current `https://dist.inference.sh/cli/manifest.json` exposes Linux and macOS builds but no Windows build. That means Windows could not be repaired by switching to the official binary installer in this environment.

## Repair

Added the missing Windows compatibility module at:

`C:\Users\datvu\AppData\Local\Programs\Python\Python313\Lib\site-packages\infsh\__main__.py`

The compatibility module now provides:

- `infsh version`
- `infsh login --api-key ...`
- `infsh login --logout`
- `infsh me`
- `infsh whoami`
- `infsh app run <app> --input <json-or-path>`
- `infsh app get <app>`
- `infsh app sample <app> [--save path]`
- `infsh app list [--category ...]`

Implementation notes:

- Uses `https://api.inference.sh` directly through `requests`
- Reads API keys from `INFSH_API_KEY` or `%APPDATA%\infsh\config.json`
- Supports anonymous `/me` and `/apps/run` calls when no API key is configured
- Reads JSON files with `utf-8-sig` so PowerShell-generated BOM files work on Windows

## Verification

Verified after repair:

```text
infsh version
```

returned:

```text
infsh compat 0.1.0 (sdk 0.5.2, base https://api.inference.sh)
```

```text
infsh me
infsh whoami
```

both returned valid JSON from `https://api.inference.sh/me` instead of crashing.

```text
infsh app run infsh/qwen3-30b-a3b --input <temp-json-path>
```

reached the API successfully and returned a service-level `402 payment_required` response instead of the previous import-time crash. That verifies the CLI path is repaired; remaining failures are account/balance state, not launcher breakage.

```text
infsh app sample google/gemini-3-1-flash-image-preview
infsh app list --category image
```

both executed successfully. `app sample` generated JSON derived from the app input schema, and `app list` returned a valid API response shape instead of a launcher error.
