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
- Products live in the `products` table; root `beforeLoad` calls `ensureCatalog()` which hydrates the in-memory `catalog` array in place (30s cache) — keeps all storefront code synchronous while admin edits reach the shop.
- Admin area lives under `src/routes/_authenticated/admin*`; access is the `admin` role in `user_roles` (first signup gets it via trigger), writes go through the browser client and RLS.
