# LAB40 – Laboratório de Funcionalidades Web

Projeto-base para avaliação prática de Integração e Entrega Contínua (CI/CD).

## Requisitos
- Node.js 20 ou superior.
- npm.

## Executar localmente
```bash
npm install
npm start
```
Acesse http://localhost:3000. Para desenvolvimento com reinicialização automática: `npm run dev`.

## Endpoints
- `GET /health`: verificação de disponibilidade.
- `GET /api/features`: lista as 40 funcionalidades e seus estados.
- `POST /api/features/:id`: executa uma funcionalidade, recebendo JSON no corpo.

Exemplo:
```bash
curl -X POST http://localhost:3000/api/features/1 -H "Content-Type: application/json" -d '{"valor":200,"percentual":15}'
```

## Estrutura
```text
lab40/
├── public/
├── src/
│   ├── app.js
│   ├── server.js
│   └── features/
├── package.json
└── package-lock.json
```

## Contrato de cada módulo
Cada arquivo `src/features/featureNN.js` exporta `id`, `name`, `description`, `implemented` e `execute(input)`.

1. Implemente `execute(input)`.
2. Valide os dados recebidos.
3. Retorne um objeto serializável em JSON.
4. Trate entradas inválidas lançando `Error` com mensagem clara.
5. Depois de implementar e validar, altere `implemented` para `true`.
6. Não altere o contrato dos outros módulos nem a API central sem autorização.

Enquanto `implemented` for `false`, a API retorna HTTP 501 para aquele módulo.

## Importante
Este repositório é entregue intencionalmente sem testes automatizados, análise estática, workflow de CI, build ou configuração de deploy. O estudante deverá criar e justificar esses elementos durante a avaliação.

O servidor escuta `process.env.PORT` e `0.0.0.0`, e a aplicação não persiste dados em disco.

---

## Entrega do aluno — Módulo 09: Contador de caracteres

**Arquivo implementado:** `src/features/feature09.js` (somente este módulo foi alterado; `implemented = true` após validação).

| Item | Descrição |
|---|---|
| Objetivo | Contar os caracteres de um texto informado. |
| Entrada de referência | `{"texto":"FATEC"}` |
| Saída esperada | quantidade=5 → `result` = `{"quantidade":5}` |
| Regras e validações | texto deve ser string. Definir contagem por caracteres Unicode percebidos pelo usuário (preferencialmente Array.from), não apenas unidades UTF-16. |
| Regra de solução | Retornar quantidade total de caracteres do texto, incluindo espaços e pontuação. |
| Entrada inválida | lança `Error` com mensagem clara (ex.: `Texto deve ser string.`); a API responde **HTTP 400** sem derrubar o servidor |

**Decisões técnicas**
- Implementação com recursos nativos do Node.js, sem dependências de produção.
- A função `execute` não altera o objeto de entrada e retorna um objeto simples serializável em JSON.
- Valores decimais/monetários: quando o enunciado envolve dinheiro, o resultado é arredondado para 2 casas com `Number(x.toFixed(2))`; nos demais casos o valor é retornado sem arredondamento.
- Datas (quando aplicável) são tratadas em UTC no formato `YYYY-MM-DD`, evitando ambiguidade de fuso.
- Textos preservam acentos e caracteres Unicode (uso de `Array.from`/`normalize` quando necessário).

## Como executar os testes

```bash
npm ci                       # instalação reproduzível (usa o package-lock.json)
npm test                     # testes automatizados (node:test, nativo)
npm run test:spec            # mesmos testes com relatório detalhado
node --test test/feature09.test.js
npm run lint                 # análise estática (ESLint)
npm run format:check         # formatação (Prettier)
npm run test:smoke           # smoke test: /health, /api/features e POST /api/features/9
npm audit --audit-level=high # auditoria de dependências
```

Os testes automatizados (`test/feature09.test.js`) cobrem: **caso válido típico** (entrada de referência), **casos de limite/fronteira** e **entradas inválidas** (verificando que `Error` é lançado). Não dependem de rede, horário real ou dados pessoais.

## Roteiro de testes manuais

| Passo | Ação | Resultado esperado | Obtido |
|---|---|---|---|
| 1 | No terminal, executar `npm install` e `npm start` | Mensagem `LAB40 disponível na porta 3000` | ☐ |
| 2 | Abrir http://localhost:3000/health | JSON `{"status":"ok","application":"LAB40"}` | ☐ |
| 3 | Abrir http://localhost:3000/api/features | Item 9 com `"implemented": true` | ☐ |
| 4 | Abrir http://localhost:3000, localizar o cartão 09 · Contador de caracteres | Cartão com status **Implementada** | ☐ |
| 5 | Clicar em **Selecionar**, manter o JSON de exemplo `{"texto":"FATEC"}` e executar | Resposta com `result` = `{"quantidade":5}` | ☐ |
| 6 | No PowerShell: `Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/features/9 -ContentType "application/json; charset=utf-8" -Body ([Text.Encoding]::UTF8.GetBytes('{"texto":"FATEC"}')) | ConvertTo-Json -Depth 5` | Mesmo `result` do passo 5 | ☐ |
| 7 | Enviar entrada inválida: `Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/features/9 -ContentType "application/json" -Body '{}'` | HTTP **400** com mensagem `Texto deve ser string.`; servidor continua ativo | ☐ |
| 8 | Repetir o passo 2 e encerrar com Ctrl+C | `/health` continua `ok` | ☐ |

## Auditoria de dependências

Comando: `npm audit --audit-level=high` (também executado no CI).

Resultado observado: `found 0 vulnerabilities`. A aplicação não possui dependências de produção; as únicas dependências são de desenvolvimento (`eslint` e `prettier`), usadas apenas para qualidade de código e excluídas da imagem Docker (`npm ci --omit=dev`). Nenhuma ação corretiva foi necessária. Caso uma vulnerabilidade alta/crítica apareça, o pipeline falha e a correção deve ser feita com `npm audit fix` ou atualização do pacote — nunca ignorando o alerta.

## Integração e entrega contínua (GitHub Actions)

- **`.github/workflows/ci.yml`** — acionado em `push`, `pull_request` (para `main`) e manualmente. Job **qualidade** (Node 20 e 22): `npm ci` → formatação → lint → testes → smoke test → `npm audit`. Job **docker** (depende do anterior): build da imagem, container efêmero, validação de `/health` e de `POST /api/features/9`, exportação `.tar` como artefato `lab40-image`.
- **`.github/workflows/cd.yml`** — acionado em `push` na `main` (após o merge). Repete o portão de qualidade, constrói e verifica a imagem e publica o artefato **`lab40-delivery-record`** com `lab40-feature09.tar` e `deployment-record.txt` (repositório, referência, SHA, tag e data).
- Nenhuma senha, token ou credencial é armazenada no repositório.

## Docker (execução local)

```bash
docker build --pull -t lab40:feature09 .
docker run -d --name lab40-container -p 3000:3000 lab40:feature09
docker ps
curl --fail http://localhost:3000/health
docker logs lab40-container
docker stop lab40-container && docker rm lab40-container
docker save lab40:feature09 -o lab40-feature09.tar
```

## Checklist da avaliação (orientações do professor em sala)

- [x] Implementar a funcionalidade atribuída (feature 09) e validar entrada e saída
- [x] Criar testes de caso típico, limites e entradas inválidas
- [x] Executar formatação, lint e auditoria
- [x] Criar branch, commit, push e Pull Request para a `main` do próprio repositório
- [x] Executar CI aprovado
- [x] Criar `Dockerfile` e `.dockerignore`
- [x] Construir imagem identificada por tag (`lab40:feature09`) e SHA (`lab40:<sha do commit>`)
- [x] Executar container e testar `/health` e o endpoint funcional (`POST /api/features/9`)
- [x] Executar CD simulado e entregar `lab40-feature09.tar` e `deployment-record.txt` (artefato `lab40-delivery-record`)
- [x] Apresentar evidências (relatório em PDF)

### Imagem, container, registry e implementação

- **Imagem**: pacote imutável gerado pelo `Dockerfile` (Node 22 Alpine + `src/` + `public/` + dependências de produção). É identificada por tags: `lab40:feature09` e `lab40:<SHA>`, o que liga a imagem ao commit exato que a gerou.
- **Container**: instância em execução de uma imagem (`docker run -p 3000:3000 ...`). É efêmero: no CI ele é criado, testado em `/health` e `/api/features/9` e removido.
- **Registry**: serviço que armazena e distribui imagens (Docker Hub, GitHub Container Registry). Neste laboratório o CD é **simulado**: em vez de publicar num registry, a imagem é exportada com `docker save` para `.tar` e entregue como artefato do GitHub Actions, junto com o `deployment-record.txt`.
- **Implantação (deploy)**: colocar a imagem para rodar no ambiente de destino. Aqui é representada pelo job `entrega` (ambiente `producao-simulada`), que só roda após o merge na `main` e depois de lint, testes e smoke test aprovados.
