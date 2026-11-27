// Testes automatizados – Feature 09: Contador de caracteres
// Execute com: node --test test/feature09.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const feature = require("../src/features/feature09");

test("contrato do módulo preservado", () => {
  assert.equal(feature.id, 9);
  assert.equal(feature.name, "Contador de caracteres");
  assert.equal(feature.implemented, true);
  assert.equal(typeof feature.execute, "function");
});

test("caso típico: entrada de referência 'FATEC' retorna quantidade 5", () => {
  assert.deepEqual(feature.execute({ texto: "FATEC" }), { quantidade: 5 });
});

test("caso típico: conta espaços e pontuação", () => {
  assert.equal(feature.execute({ texto: "Olá, mundo!" }).quantidade, 11);
});

test("limite: string vazia retorna 0 e somente espaços são contados", () => {
  assert.equal(feature.execute({ texto: "" }).quantidade, 0);
  assert.equal(feature.execute({ texto: "  " }).quantidade, 2);
});

test("limite: acentos e emoji contam como um caractere (Unicode)", () => {
  assert.equal(feature.execute({ texto: "ação" }).quantidade, 4);
  assert.equal(feature.execute({ texto: "🙂" }).quantidade, 1);
});

test("inválido: rejeita número, null, array, campo ausente e entrada ausente", () => {
  for (const input of [
    { texto: 123 },
    { texto: null },
    { texto: ["a"] },
    {},
    undefined,
  ]) {
    assert.throws(() => feature.execute(input), {
      name: "Error",
      message: "Texto deve ser string.",
    });
  }
});

test("não modifica o objeto de entrada", () => {
  const entrada = { texto: "FATEC" };
  feature.execute(entrada);
  assert.deepEqual(entrada, { texto: "FATEC" });
});
