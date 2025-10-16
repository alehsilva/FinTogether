# Scripts do FinTogether

Este diretório contém utilitários para gerenciar ícones e PWA do projeto.

## 📱 pwa-icons.js

Utilitário principal para gerenciar ícones do PWA.

### Comandos:

```bash
# Verificar status do PWA
node scripts/pwa-icons.js check

# Atualizar ícones da pasta splash
node scripts/pwa-icons.js update
```

### Uso no package.json:

```json
{
  "scripts": {
    "icons:check": "node scripts/pwa-icons.js check",
    "icons:update": "node scripts/pwa-icons.js update"
  }
}
```

## 🔧 Funcionalidades:

- **check**: Verifica se todos os ícones essenciais existem
- **update**: Copia ícone atualizado da pasta splash para todos os tamanhos PWA

## 📋 Ícones gerenciados:

- `favicon.png` - Favicon do navegador
- `icon-48x48.png` até `icon-512x512.png` - Ícones PWA
- Baseados no arquivo `public/splash_screens/icon.png`

---

*Automatizado para FinTogether PWA* 🚀
