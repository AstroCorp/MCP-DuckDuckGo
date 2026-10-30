# MCP DuckDuckGo

[English](#english) | [Español](#español)

---

## English

MCP server that searches DuckDuckGo and extracts plain text from result pages (Playwright renders JavaScript).

> [!WARNING]
> Extracted web content may include prompt injection. Review it in sensitive contexts.

**Requires:** Node.js 26+, pnpm, Chromium (`pnpm exec playwright install chromium`)

```bash
pnpm install
pnpm exec playwright install chromium
pnpm build
```

MCP config:

```json
{
  "mcpServers": {
    "MCP-DuckDuckGo": {
      "command": "node",
      "args": ["C:\\Proyectos\\MCP-DuckDuckGo\\dist\\index.js"]
    }
  }
}
```

**Tool `search`:** `query` (string), `numResults` (number, default 3). Returns plain text per result, separated by `---`.

| Command | Description |
|---------|-------------|
| `pnpm dev` | Watch mode |
| `pnpm build` | Build |
| `pnpm start` | Run server |
| `pnpm test` | Tests |
| `pnpm example` | Example script |

---

## Español

Servidor MCP que busca en DuckDuckGo y extrae texto plano de los resultados (Playwright renderiza JavaScript).

> [!WARNING]
> El contenido extraído puede incluir inyección de prompts. Revísalo en contextos sensibles.

**Requiere:** Node.js 26+, pnpm, Chromium (`pnpm exec playwright install chromium`)

```bash
pnpm install
pnpm exec playwright install chromium
pnpm build
```

Configuración MCP:

```json
{
  "mcpServers": {
    "MCP-DuckDuckGo": {
      "command": "node",
      "args": ["C:\\Proyectos\\MCP-DuckDuckGo\\dist\\index.js"]
    }
  }
}
```

**Herramienta `search`:** `query` (string), `numResults` (number, default 3). Devuelve texto plano por resultado, separado por `---`.

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Modo watch |
| `pnpm build` | Compilar |
| `pnpm start` | Arrancar servidor |
| `pnpm test` | Tests |
| `pnpm example` | Script de ejemplo |
