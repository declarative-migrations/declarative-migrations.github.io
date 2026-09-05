# Declarative Migrations website agent instructions

## Website and release-documentation invariants

- This Astro site documents the behavior of the migration engine; examples, commands, supported tools, release links, safety claims, and installation instructions must match the current source repository and published artifacts.
- Never state that destructive operations are safe, automatic, or reversible unless the implementation and tests prove it. Preserve explicit consent requirements and fail-closed wording.
- Keep migration convergence, cross-check tooling, ORM-agnostic behavior, supported databases, flags, exit behavior, and package/version references synchronized with the engine.
- GitHub Pages deployment must build the exact reviewed source. Pin Actions, minimize permissions, avoid persisted checkout credentials, and keep concurrency/deployment provenance explicit.
- Preserve accessible semantic HTML, responsive behavior, dark/light themes, safe external links, and usable code examples.
- Do not introduce secrets, analytics payloads containing sensitive data, unreviewed third-party scripts, or remote assets that weaken the site's security/privacy posture.

## Instruction discovery

Resolve `$PWD`, walk upward through every parent directory to the filesystem root, read every readable lowercase `agents.md` on that ancestor chain, and apply them root-to-leaf. Do not search siblings. Deduplicate resolved paths/inodes, avoid symlink cycles, and report unreadable files.

## Synchronize with the remote

Before editing, inspect `git status`, current branch, configured remotes, and the default branch. Run `git fetch --all --prune` and create the feature branch from the latest remote default branch. Fetch again before pushing and incorporate upstream changes with `git merge` or `git pull` on a clean working tree.

- avoid git rebase in favor of git merge.
- Never discard remote commits, force-push, rewrite shared history, bypass review, or bypass required CI.

## Resolve Git conflicts semantically

Resolve conflicts by understanding and combining both sides' intent. Do not mechanically choose `ours`, `theirs`, current, or incoming changes. Produce the conceptually correct result while preserving accurate product/safety claims, release/install references, examples, accessibility, Astro behavior, deployment provenance, tests, documentation, configuration, and public URLs. Regenerate built output from merged source rather than selecting one side's `dist` files. If intentions are incompatible, make the smallest explicit design decision and document it in the pull request.

After resolving, reread every affected file from the top, verify documentation against the current engine and release metadata, run Astro checks/builds and link/accessibility tests, validate GitHub Actions, and search the entire worktree for conflict markers:

```sh
grep -RInE '^(<<<<<<<|=======|>>>>>>>)' --exclude-dir=.git .
```

If any marker or suspicious partial resolution remains, repeat semantic resolution from the top and rerun validation. A conflict is resolved only when the site is conceptually coherent, accurate, and verified, not merely accepted by Git.

## Repository-local Git worktrees

- Create or use a Git worktree only when the human operator explicitly authorizes it for the current task. Concurrency or a dirty checkout is not permission by itself.
- Put every authorized worktree at `<repository-root>/tmp/worktrees/<name>`; from the repository root, use `./tmp/worktrees/<name>`. Never place worktrees beside repositories or organization directories.
- Keep `tmp`, `temp`, `tmp/worktrees`, and `temp/worktrees` ignored in the repository-root `.gitignore`. Do not commit files from those directories.
- Relocate or remove a worktree only when the operator explicitly requests it. Before removal, preserve and publish intended changes, verify its commit is represented on the target branch, and confirm there are no tracked, untracked, ignored-sensitive, or in-use files that must survive. Remove it with `git worktree remove <path>` without `--force`; never delete a worktree directory with `rm`.
