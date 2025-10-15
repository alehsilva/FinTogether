# 🎨 FinTogether - Design System

## **Filosofia de Design**
Uma aplicação financeira precisa transmitir **confiança**, **clareza** e **profissionalismo**. As cores escolhidas devem:
- Facilitar a compreensão rápida de dados financeiros
- Criar uma experiência calma e focada
- Transmitir seriedade e confiabilidade

## **Paleta de Cores Principal**

### 🟢 **Verde Financeiro (Positivo)**
```
emerald-50   #ecfdf5   // Backgrounds sutis
emerald-100  #d1fae5   // Hover states leves
emerald-500  #10b981   // Elementos secundários
emerald-600  #059669   // Cor principal para receitas/lucros
emerald-700  #047857   // Hover states
emerald-800  #065f46   // Estados ativos/pressed
```

### 🔴 **Vermelho Financeiro (Negativo)**
```
rose-50      #fff1f2   // Backgrounds sutis
rose-100     #ffe4e6   // Hover states leves
rose-500     #f43f5e   // Elementos secundários
rose-600     #e11d48   // Cor principal para despesas/perdas
rose-700     #be185d   // Hover states
rose-800     #9f1239   // Estados ativos/pressed
```

### 🔵 **Azul Confiança (Ações)**
```
blue-50      #eff6ff   // Backgrounds sutis
blue-100     #dbeafe   // Hover states leves
blue-500     #3b82f6   // Elementos secundários
blue-600     #2563eb   // Cor principal para ações/foco
blue-700     #1d4ed8   // Hover states
blue-800     #1e40af   // Estados ativos/pressed
```

### ⚫ **Slate Profissional (Interface)**
```
slate-50     #f8fafc   // Background principal
slate-100    #f1f5f9   // Cards e seções
slate-300    #cbd5e1   // Bordas sutis
slate-400    #94a3b8   // Texto secundário
slate-600    #475569   // Texto principal
slate-700    #334155   // Elementos destacados
slate-800    #1e293b   // Painéis laterais
slate-900    #0f172a   // Headers e navigation
```

### ⚪ **Neutros**
```
white        #ffffff   // Cards, modais, conteúdo
gray-50      #f9fafb   // Background alternativo
gray-100     #f3f4f6   // Seções secundárias
```

## **Aplicação por Componente**

### 📊 **Balance Card**
- **Positivo**: `bg-gradient-to-br from-emerald-600 to-emerald-700`
- **Negativo**: `bg-gradient-to-br from-rose-600 to-rose-700`
- **Neutro**: `bg-gradient-to-br from-slate-600 to-slate-700`

### 💳 **Transaction Panel**
- **Background**: `bg-slate-900` (normal) / `bg-slate-800` (editando)
- **Borders**: `border-slate-700` (normal) / `border-blue-500` (editando)
- **Header**: `bg-slate-700/70` quando editando

### 🔘 **Botões de Ação**
- **Receita**: `bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25`
- **Despesa**: `bg-rose-600 hover:bg-rose-700 shadow-rose-500/25`
- **Editar**: `bg-blue-600 hover:bg-blue-700 shadow-blue-500/25`

### 📝 **Transações na Lista**
- **Receita Icon**: `bg-emerald-50 border-emerald-200 text-emerald-600`
- **Despesa Icon**: `bg-rose-50 border-rose-200 text-rose-600`
- **Valores**: `text-emerald-600` (receita) / `text-rose-600` (despesa)

### 🎯 **Estados Especiais**
- **Pendente**: `bg-amber-50 border-amber-200 text-amber-700`
- **Editando**: `ring-blue-500 shadow-blue-500/30`
- **Loading**: `bg-slate-100 animate-pulse`

## **Gradientes e Sombras**

### **Gradientes Financeiros**
```css
/* Sucesso/Lucro */
.gradient-success {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
}

/* Alerta/Perda */
.gradient-danger {
  background: linear-gradient(135deg, #e11d48 0%, #be185d 100%);
}

/* Neutro/Profissional */
.gradient-neutral {
  background: linear-gradient(135deg, #475569 0%, #334155 100%);
}
```

### **Sombras com Cor**
```css
/* Sombra Verde (Sucesso) */
.shadow-success {
  box-shadow: 0 10px 25px -5px rgba(5, 150, 105, 0.25);
}

/* Sombra Vermelha (Atenção) */
.shadow-danger {
  box-shadow: 0 10px 25px -5px rgba(225, 29, 72, 0.25);
}

/* Sombra Azul (Foco) */
.shadow-focus {
  box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.25);
}
```

## **Acessibilidade**

### **Contraste Mínimo**
- Texto principal: Ratio 7:1 (AAA)
- Texto secundário: Ratio 4.5:1 (AA)
- Elementos interativos: Ratio 3:1

### **Daltonismo**
- Verde e vermelho nunca são a única diferenciação
- Ícones e padrões complementam as cores
- Estados são indicados por múltiplos sinais visuais

## **Implementação**

### **CSS Custom Properties**
```css
:root {
  --color-success: #059669;
  --color-success-light: #10b981;
  --color-success-dark: #047857;

  --color-danger: #e11d48;
  --color-danger-light: #f43f5e;
  --color-danger-dark: #be185d;

  --color-primary: #2563eb;
  --color-primary-light: #3b82f6;
  --color-primary-dark: #1d4ed8;
}
```

### **Próximos Passos**
1. ✅ **Transaction Panel** - Implementado
2. 🔄 **Balance Cards** - Em andamento
3. ⏳ **Transaction List** - Pendente
4. ⏳ **Charts Section** - Pendente
5. ⏳ **Month Selector** - Pendente
6. ⏳ **Form Components** - Pendente

---

**Objetivo**: Criar uma identidade visual coesa que transmita profissionalismo e facilite a compreensão de dados financeiros complexos.
