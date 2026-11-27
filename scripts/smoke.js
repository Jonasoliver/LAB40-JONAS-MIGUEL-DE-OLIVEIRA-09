// Smoke test: sobe a aplicação em uma porta livre e verifica as rotas principais.
// Uso: npm run test:smoke
const { createServer } = require("node:http");
const assert = require("node:assert/strict");
const app = require("../src/app");

const FEATURE_ID = 9;
const ENTRADA = {
  texto: "FATEC",
};

async function main() {
  const server = createServer(app);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const health = await fetch(`${base}/health`);
    assert.equal(health.status, 200);
    assert.equal((await health.json()).status, "ok");
    console.log("OK  GET /health");

    const lista = await (await fetch(`${base}/api/features`)).json();
    assert.equal(lista.total, 40);
    const minha = lista.items.find((item) => item.id === FEATURE_ID);
    assert.ok(minha, `feature ${FEATURE_ID} não encontrada`);
    assert.equal(
      minha.implemented,
      true,
      `feature ${FEATURE_ID} deve estar implemented=true`,
    );
    console.log(`OK  GET /api/features (feature ${FEATURE_ID} implementada)`);

    const resposta = await fetch(`${base}/api/features/${FEATURE_ID}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ENTRADA),
    });
    const corpo = await resposta.json();
    assert.equal(resposta.status, 200, JSON.stringify(corpo));
    assert.equal(typeof corpo.result, "object");
    console.log(
      `OK  POST /api/features/${FEATURE_ID} -> ${JSON.stringify(corpo.result)}`,
    );

    const invalida = await fetch(`${base}/api/features/${FEATURE_ID}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{json invalido",
    });
    assert.equal(invalida.status, 400);
    console.log(
      `OK  POST /api/features/${FEATURE_ID} com JSON inválido -> 400`,
    );
    console.log("Smoke test concluído com sucesso.");
  } finally {
    server.close();
  }
}

main().catch((erro) => {
  console.error("Smoke test falhou:", erro.message);
  process.exit(1);
});
