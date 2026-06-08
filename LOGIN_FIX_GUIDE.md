# Solução: Erro de Login - Banco de Dados Corrompido

## Problema Identificado

Seu banco remoto em Render tem **19 problemas críticos**:

### 1. Emails Duplicados (1 problema)
- **Email**: `teste@gmail.com` aparece em **3 usuários diferentes**
  - ID: `1` (senha: "123")
  - ID: `1a4abfb5-4537-4713-bba2-dca29f364aab` (senha: hasheada)
  - ID: `dc3cad1f-cd12-4c70-a9dd-44ca1486f0e9` (senha: hasheada)

**Por que falha o login?**
- Você digita: `teste@gmail.com` + senha `123`
- Frontend faz hash: `123` → `a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3`
- Sistema procura por usuário onde `email == 'teste@gmail.com'` E `password == '[hash]'`
- Encontra o **PRIMEIRO match** (ID "1") que tem `password: "123"` em **texto plano** ❌
- Comparação falha: `"123" !== "a665a45920..."`

### 2. Senhas em Texto Plano (5 problemas)
```
❌ teste@gmail.com      → "123"
❌ outro@gmail.com      → "456"
❌ arthurgonsal@hotmail.com → "123"
❌ test3e@gmail.com     → "123"
❌ teste123@gmail.com   → "123"
```

Deveriam estar hashadas em SHA-256!

### 3. Inconsistência de Campos (5 problemas)
Alguns usuários têm `nome`, outros têm `name`

---

## Como Corrigir

### Opção 1: Usar o Banco Corrigido (Recomendado)

1. O arquivo `database_cleaned.json` foi gerado com todos os problemas corrigidos
2. Ele está pronto para substituir seu banco remoto

**Passos:**
```bash
# 1. Visualize o arquivo corrigido
cat database_cleaned.json

# 2. Se aprovar, você precisa:
# - Fazer upload do arquivo para seu servidor Render
# - Ou usar a API de seu banco remoto para substituir os dados
```

**Se seu banco remoto for acessível via PUT:**
```bash
curl -X PUT "https://database-save-app.onrender.com/users" \
  -H "Content-Type: application/json" \
  -d @database_cleaned.json
```

---

### Opção 2: Usar o Endpoint Local de Limpeza

Se você usar o servidor local (`USE_LOCAL_SERVER = true` em `config.ts`):

```bash
# 1. Ative o servidor local
cd save-project
npm run dev  # ou node server.cjs

# 2. Em outro terminal, execute a limpeza:
curl -X POST "http://localhost:3001/cleanup"

# 3. Verifique o status:
curl "http://localhost:3001/status"
```

---

### Opção 3: Corrigir Manualmente

Se não conseguir fazer upload automático:

1. Acesse seu banco em Render
2. Para cada usuário com problema:
   - **Remova** IDs "1" e "1a4abfb5..." (duplicatas de teste@gmail.com)
   - **Substitua** senhas em texto plano pela versão hasheada:
     - `"123"` → `"a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"`
     - `"456"` → `"af4131a90e43eec5d457a5eaf1d96f20f0eb9d4239aeb1e2c52957baa1b2c5f0"`

---

## Teste de Login Após Correção

Após corrigir, teste o login com:

**Email:** `teste@gmail.com` (ou qualquer outro email único)
**Senha:** `123` (será hasheada automaticamente)

O sistema agora encontrará o usuário correto ✓

---

## Usuários Únicos Após Limpeza (15 no total)

```
1. outro@gmail.com
2. arthurgonsal@hotmail.com
3. test3e@gmail.com
4. teste123@gmail.com
5. teste12322@gmail.com
6. tassadadseste@gmail.com
7. teste@gmail.com          ← Mantém o último registro
8. tesasdasdasdte@gmail.com
9. user@gmail.com
10. amanda@email.com
11. testasddase@gmail.com
12. dados@gmail.com
13. teste1@gmail.com
14. isadoramian@gmail.com
15. userteste@gmail.com
```

---

## Checklist de Resolução

- [ ] Revisar `database_cleaned.json`
- [ ] Fazer backup do banco atual
- [ ] Escolher método de correção (Opção 1, 2 ou 3)
- [ ] Executar a limpeza
- [ ] Testar login com credenciais conhecidas
- [ ] Verificar se consegue acessar conta
- [ ] Limpar dados de teste antigos

---

## Erro Específico no Seu Caso

Se você está tentando logar com:
- **Email:** seu_email@example.com
- **Senha:** sua_senha

E não consegue, verifique se:
1. O email existe no banco limpo
2. A senha está correta
3. Se há duplicata do email

Execute `GET /status` para diagnosticar.
