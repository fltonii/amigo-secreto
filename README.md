# Amigo Secreto da Família

Site estático (GitHub Pages) para o amigo secreto da família:
https://fltonii.github.io/amigo-secreto/

Cada pessoa abre o link, toca no próprio nome, confirma e vê quem tirou.
O sorteio é feito uma única vez por um script e fica salvo em `src/pairs.generated.ts`
(em base64, só para não ficar legível de cara no código-fonte; não é segredo de verdade).

## Rodar localmente

Precisa de Node 22+ e pnpm.

```sh
pnpm install
pnpm dev        # desenvolvimento
pnpm build && pnpm preview   # versão final em http://localhost:4173/amigo-secreto/
```

Outros comandos:

- `pnpm verificar`: confere se o sorteio salvo é válido (todos dão e recebem um presente, ninguém tira a si mesmo). Não mostra os pares.
- `pnpm test`: testes do sorteio.
- `pnpm lint`: lint.

## Refazer o sorteio

> ⚠️ **Refazer o sorteio muda o resultado de todo mundo.** Quem já viu o próprio amigo secreto
> vai passar a ver outro nome. Só faça isso antes de mandar o link, ou avisando a família toda.

1. Se mudou alguém na lista, edite `src/participants.ts` (é a única lista, usada pelo site e pelo sorteio).
2. `pnpm sortear` (grava um novo `src/pairs.generated.ts`).
3. `pnpm verificar`
4. Commit e push para `main`. O GitHub Actions publica sozinho.

O `pnpm build` nunca refaz o sorteio; o deploy só publica o que está commitado.
Se a lista de participantes mudar sem refazer o sorteio, `pnpm verificar` falha e o deploy é bloqueado.
