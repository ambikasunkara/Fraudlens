<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

## Architecture rules

- Roles live only in `public.user_roles` (admin/analyst/viewer), checked via `has_role`/`can_write`/`has_any_role`. Why: storing roles on profiles lets users grant themselves more access.
- AI runs through Lovable AI: `google/gemini-2.5-flash` for narratives and judging, `google/gemini-embedding-2` (3072 dimensions) for vectors. Why: the user chose Lovable AI over their own Gemini key.
- `case_embeddings` has no ANN index, so searches are an exact scan. Why: 3072 dimensions is above the HNSW limit, and the synthetic set is small.
- Historical cases are forced to `source_type = 'synthetic'`. Why: synthetic data must never be passed off as real banking cases.
