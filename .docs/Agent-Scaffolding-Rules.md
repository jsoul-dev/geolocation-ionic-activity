# Agent Instructions: Scaffolding Rules for This Ionic-Angular Project

Follow these rules strictly for initializing the project and for every page, component, and service you add to it afterward.

## 0. Project initialization — use `ionic start` with explicit flags, never the interactive wizard

When starting a brand-new project, do **not** run bare `ionic start` and answer prompts interactively. Run it non-interactively with explicit flags so the framework, template, and standalone setting are locked in from the very first command:

```bash
ionic start <project-name> blank --type=angular --standalone
```

- `<project-name>` — no spaces, no brackets; use kebab-case (e.g. `cabanatuan-city-ordinance-portal-ionic`)
- `blank` — the starter template; do not use `tabs`, `sidemenu`, or any other starter, since this course's material is built entirely around the blank template's structure
- `--type=angular` — this project uses Angular, not React or Vue
- `--standalone` — mandatory; this project uses standalone components exclusively, never `NgModule`. Do not omit this flag and do not accept a non-standalone scaffold

This lets Ionic initialize git and make its own first commit automatically. Do not pass `--no-git` — an initialized repo from the very first command is required for rule #6 below (committing after every change) to work correctly.

After creation:
```bash
cd <project-name>
ionic serve
```
Confirm the app runs at `http://localhost:8100` before generating any pages/components/services.

### Verify the scaffold is correct before continuing
Open `src/app/app.component.ts` (or any generated file) and confirm:
- `standalone: true` is present (or implied by the newer Angular default with no `NgModule` anywhere in the project)
- There is no `app.module.ts` anywhere in `src/app/`
- `src/app/app.routes.ts` exists and uses `loadComponent`, not `loadChildren` pointing at a module

If any of these checks fail, the project was not scaffolded correctly — do not proceed to generate pages/components on top of a broken base; re-run `ionic start` with the flags above instead of patching it manually.

## 1. Always use the Ionic CLI to generate pages/components/services — never create them manually

Do **not** hand-write new `.ts` / `.html` / `.scss` / `.spec.ts` files yourself for pages, components, or services. Always run the actual Ionic CLI command and let it scaffold the files, then edit the generated files afterward.

```bash
ionic g page pages/<page-name>
ionic g component components/<component-name>
ionic g service services/<service-name>
```

This matters because `ionic generate` creates the **full standard file set** for each artifact (e.g. a page gets `.ts`, `.html`, `.scss`, and `.spec.ts` together, correctly wired with matching selectors, `templateUrl`, and `styleUrls`). Manually writing files by hand tends to skip files (most commonly the `.scss` file), which is inconsistent with how every other page in this project was created and is easy for a reviewer to notice.

## 2. Never delete existing files

Do not delete any file in this project — including `.scss` files that appear empty, `.spec.ts` test files, or any other CLI-generated file — even if it looks unused. If a generated file genuinely isn't needed for a specific page's styling, leave it empty rather than removing it. Every page/component in this project must keep the same file structure the CLI produces.

## 3. Do not add code comments

Do not add `//`, `/* */`, or any other comments in generated or edited TypeScript, HTML, or SCSS files. Write self-explanatory code instead. This applies to new files and to any existing files you edit.

## 4. If a file already exists

If a page/component/service you're about to generate already exists in the project, do not regenerate or overwrite it — edit the existing files directly instead, following rules #2 and #3 above.

## 5. After generating

After running `ionic g ...`, verify the generated `.ts` file uses:
- `standalone: true` (or the newer standalone default with no `NgModule`)
- an `imports: [...]` array listing every Ionic/Angular dependency the template uses
- `inject()` for any service dependency — not constructor injection

## 6. Commit to git after every meaningful change

Use git throughout the project, not just once at the end. This makes bad changes easy to find and revert, and produces a realistic commit history instead of one giant dump.

- `ionic start` (per rule #0) already initializes git and makes an initial commit. Verify with `git log` that this happened before generating anything else.
- After **every** `ionic g page/component/service` command, commit immediately, before writing any feature logic into the generated files:
  ```bash
  git add .
  git commit -m "generate <type>: <name>"
  ```
  Example: `git commit -m "generate page: ordinances"`
- After implementing a page/component/service's logic and template (i.e., after the feature actually works), commit again as a separate commit:
  ```bash
  git add .
  git commit -m "implement <name>: <short description of what it does>"
  ```
  Example: `git commit -m "implement ordinances page: list, search, and card rendering"`
- Keep each commit scoped to one page/component/service/feature at a time. Do not batch multiple unrelated features into a single commit.
- Write commit messages in plain, factual, present-tense terms describing what changed — no marketing language, no rubric references, no mentions of the professor, the lab, or grading criteria.
- Never use `git commit --amend` or `git rebase` to rewrite history, and never force-push. If something needs fixing, make a new commit that fixes it.
- Never run `git reset --hard`, `git checkout -- .`, or anything else that discards uncommitted work, unless explicitly asked to. If a change turns out to be wrong, revert it with a new commit (`git revert <hash>`) rather than erasing history.

## 7. If a mistake is made

If a generated or edited file turns out to be wrong, fix it forward with a new, clearly-described commit. Do not delete the file (see rule #2) and do not silently overwrite a previous commit's message or content — the commit history should read as a normal, incremental build-up of the project from an empty scaffold to the finished app.
