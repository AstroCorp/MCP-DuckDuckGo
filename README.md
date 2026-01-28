# MCP DuckDuckGo

[English](#english) | [Español](#español)

---

## English

### Description

MCP DuckDuckGo is a Model Context Protocol (MCP) server that enables AI assistants to search the internet using DuckDuckGo and extract clean, formatted content from web pages. It provides real-time access to current information, converting HTML pages into readable Markdown format.

> [!WARNING]
> This is an experimental project. Currently, it does not support websites that load content dynamically with JavaScript. Only static HTML content can be extracted.

**Features:**
- 🔍 Search the web using DuckDuckGo
- 📄 Extract and convert web content to clean Markdown
- ⚡ Per-domain rate limiting to avoid overwhelming servers
- 💾 Smart caching (LRU cache with 10-minute TTL)
- 🎯 Single unified `search` tool for simplicity

### Requirements

- **Node.js 22 or higher**
- **pnpm**

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd MCP-DuckDuckGo
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Build the project:**
   ```bash
   pnpm build
   ```

4. **Configure your MCP client:**
   
   Add the following configuration to your MCP settings file (e.g., `cline_mcp_settings.json` for Cline, or Claude Desktop config):

   ```json
   {
     "mcpServers": {
       "MCP-DuckDuckGo": {
         "command": "node",
         "args": [
           "/path/to/mcps/MCP-DuckDuckGo/dist/index.js"
         ]
       }
     }
   }
   ```

   **Windows example:**
   ```json
   {
     "mcpServers": {
       "MCP-DuckDuckGo": {
         "command": "node",
         "args": [
           "C:\\Users\\YourUsername\\mcps\\MCP-DuckDuckGo\\dist\\index.js"
         ]
       }
     }
   }
   ```

   **Linux/Mac example:**
   ```json
   {
     "mcpServers": {
       "MCP-DuckDuckGo": {
         "command": "node",
         "args": [
           "/home/username/mcps/MCP-DuckDuckGo/dist/index.js"
         ]
       }
     }
   }
   ```

5. **Restart your MCP client** to load the new server.

### Development

| Command | Description |
|---------|-------------|
| `pnpm dev` | Development mode (watch) |
| `pnpm build` | Build the project |
| `pnpm start` | Start the compiled server |
| `pnpm test` | Run all tests |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm example` | Run example script |

---

## Español

### Descripción

MCP DuckDuckGo es un servidor del Protocolo de Contexto de Modelo (MCP) que permite a los asistentes de IA buscar en internet usando DuckDuckGo y extraer contenido limpio y formateado de páginas web. Proporciona acceso en tiempo real a información actual, convirtiendo páginas HTML en formato Markdown legible.

> [!WARNING]
> Este es un proyecto experimental. Actualmente, no soporta sitios web que cargan contenido dinámicamente con JavaScript. Solo se puede extraer contenido HTML estático.

**Características:**
- 🔍 Búsqueda web usando DuckDuckGo
- 📄 Extracción y conversión de contenido web a Markdown limpio
- ⚡ Limitación de tasa por dominio para no sobrecargar servidores
- 💾 Caché inteligente (LRU con TTL de 10 minutos)
- 🎯 Herramienta única `search` unificada para simplicidad

### Requisitos

- **Node.js 22 o superior**
- **pnpm**

### Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone <url-del-repositorio>
   cd MCP-DuckDuckGo
   ```

2. **Instalar dependencias:**
   ```bash
   pnpm install
   ```

3. **Compilar el proyecto:**
   ```bash
   pnpm build
   ```

4. **Configurar tu cliente MCP:**
   
   Añade la siguiente configuración a tu archivo de configuración MCP (ej: `cline_mcp_settings.json` para Cline, o la configuración de Claude Desktop):

   ```json
   {
     "mcpServers": {
       "MCP-DuckDuckGo": {
         "command": "node",
         "args": [
           "/ruta/a/mcps/MCP-DuckDuckGo/dist/index.js"
         ]
       }
     }
   }
   ```

   **Ejemplo Windows:**
   ```json
   {
     "mcpServers": {
       "MCP-DuckDuckGo": {
         "command": "node",
         "args": [
           "C:\\Users\\TuUsuario\\mcps\\MCP-DuckDuckGo\\dist\\index.js"
         ]
       }
     }
   }
   ```

   **Ejemplo Linux/Mac:**
   ```json
   {
     "mcpServers": {
       "MCP-DuckDuckGo": {
         "command": "node",
         "args": [
           "/home/usuario/mcps/MCP-DuckDuckGo/dist/index.js"
         ]
       }
     }
   }
   ```

5. **Reinicia tu cliente MCP** para cargar el nuevo servidor.

### Desarrollo

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Modo desarrollo (watch) |
| `pnpm build` | Compilar el proyecto |
| `pnpm start` | Iniciar el servidor compilado |
| `pnpm test` | Ejecutar todos los tests |
| `pnpm test:watch` | Ejecutar tests en modo watch |
| `pnpm example` | Ejecutar script de ejemplo |
