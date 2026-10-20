# Suite Beta

Repositório pai da Suite Beta. Os componentes continuam mantidos em seus próprios repositórios e são incorporados aqui como Git Submodules.

## Clonar tudo

```bash
git clone --recurse-submodules https://github.com/gmtth/suite-beta.git
```

Se o repositório pai já foi clonado:

```powershell
.\scripts\initialize.ps1
```

## Atualizar todos os componentes

```powershell
.\scripts\update.ps1
```

O repositório pai registra um commit específico de cada submodule. Depois de atualizar, revise o resultado e faça commit no pai para fixar as novas versões.

## Estrutura

- `skills/`: skills individuais da Suite Beta.
- `plugins/`: plugins que acompanham a Suite Beta.
- `.gitmodules`: URLs e caminhos dos repositórios externos.
- `scripts/`: automação de inicialização e atualização.

## Desenvolvimento de uma skill

Entre no diretório da skill, faça alterações e publique-as no repositório filho. Depois, no repositório pai, atualize o ponteiro do submodule:

```bash
git -C skills/skill-beta-sites pull
git add skills/skill-beta-sites
git commit -m "Update skill-beta-sites"
```

O pai não copia nem mistura o histórico dos repositórios filhos; ele apenas fixa qual commit de cada um faz parte da Suite Beta.
