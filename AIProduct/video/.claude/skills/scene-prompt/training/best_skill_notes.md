# scene-prompt Best Skill Notes

## 2026-06-18 Baseline

Accepted behavior:

- Direct invocation asks for mode selection.
- Mode 1 can generate from a short phrase.
- Mode 2 uses a guided interview one question at a time, includes recommendations, and accepts `你推荐`.
- Mode 3 requires staged questioning and web reference search.
- Reference image prompts use `Color palette:`.
- Text-only prompts use `Cinematic color tone:` with exactly one film formatted as `《...》`.
- Text-only prompts include `Photography / grading parameters:` with color space, LUT, white balance / color temperature, exposure, contrast curve, dynamic range / highlight rolloff, lens / focal length, aperture, ISO, shutter angle, diffusion / filtration, and sharpening / noise policy.
- Final prompts include positive and negative supplements.

Open improvement targets:

- Add a small automated lint script to check the presence / absence of `Color palette:` vs `Cinematic color tone:` in saved sample outputs.
- Build a curated film-tone recommendation table by scene family.
- Add examples for interiors, sci-fi bases, microscopic worlds, deep sea, fantasy castles, and urban survival markets.

## 2026-06-18 Trained v2

Accepted improvements:

- Subject/genre inference now comes before 焚决 desert defaults.
- Desert frontier defaults are only used for desert, tribal, canyon, dune, sand-skiff, mechanical beast, 焚决, or 万物生 briefs.
- Camera is no longer universally top-down aerial; it is selected from the scene goal.
- Golden-hour desert light is no longer universal; lighting is selected from the requested subject.
- Added a one-film `Film Tone Recommendation Guide` for common scene families.

## 2026-06-18 Trained v3

Accepted improvements:

- `Cinematic color tone:` now requires exactly one concrete film title in Chinese book-title brackets, such as `《Dune: Part One》`.
- Text-only prompts now require a mandatory `Photography / grading parameters:` block.
- The technical parameter block must include professional generation-control settings: color space, LUT, color temperature, exposure, contrast curve, dynamic range / highlight rolloff, lens, aperture, ISO, shutter angle, diffusion / filtration, and sharpening / noise policy.

Validation score:

- Static validation: passed.
- Manual validation: 95 / 100.

Remaining risk:

- Mode 3 depends on web search quality and source availability.
- Reference-image color extraction is instruction-based, not automated pixel sampling.

## 2026-06-18 Trained v4

Accepted improvements:

- Fixed the final output structure to the user's required template:
  `【prompt】`, `Foreground:`, `Middle ground:`, `Background:`, `Lighting:`, then one conditional color-control block (`Color palette:` for reference-image prompts, or `Cinematic color tone:` plus `Photography / grading parameters:` for text-only prompts), `PHOTOGRAPHIC TONE:`, `Positive supplement:`, `Negative supplement:`, `Avoid:`.
- Made the Chinese scene interpretation an internal planning step only, so it cannot add an extra section before `【prompt】`.
- Removed the compact run-check list from final outputs because it violates the required copy-ready structure.
- Added static checks to prevent old run-check validation rules from returning.
- Updated validation cases, scoring rubric, README, and validation report to use the fixed final-output structure as the acceptance gate.

Validation score:

- Static validation: passed.
- Manual validation: 98 / 100.

Remaining risk:

- Reference-image color extraction remains instruction-based, not automated pixel sampling.
- Mode 3 web-reference quality still depends on available search results and source pages.

## 2026-06-18 Trained v5

Accepted improvements:

- Replaced the mode 2 `时代 / 类型` condition with `风格锚定`.
- Added `Style Anchor Rule` so visual style controls realism, material behavior, architecture, lens language, and the final `PHOTOGRAPHIC TONE:`.
- Defined `真实题材电影摄影风格` as a strict realism anchor: real-world physical logic, real architecture, plausible weather, natural lens perspective, believable crowd scale, and no fantasy / sci-fi / floating structures unless explicitly requested.
- Updated training and validation cases to preserve style anchors and reject the old `时代 / 类型` field.

Validation score:

- Static validation: passed.

Remaining risk:

- If users choose stylized anchors such as illustration or game concept art, downstream prompts must still keep the final fixed structure while adapting `PHOTOGRAPHIC TONE:` wording carefully.

## 2026-06-18 Trained v6

Accepted improvements:

- Expanded `风格锚定` from a short 3-option list into a broad reusable style-anchor library.
- Covered realistic photography, documentary, photojournalism, street photography, architecture, interior, landscape, wildlife, aerial, astrophotography, macro, underwater, commercial, fashion, food, product, black-and-white, film photography, historical production design, epic cinema, noir / suspense, war, road movie, neorealism, practical sci-fi, cyberpunk, live-action fantasy, horror, MV visuals, 3D / PBR / Archviz, product render, isometric, low-poly, clay render, white/gray model, technical visualization, NPR, toon shading, voxel, feature animation, stop-motion miniature, anime, American animation, children's book, vector, watercolor, gouache, digital painting, Chinese gongbi, ink-wash, ukiyo-e, manga line art, pixel art, game concept art, environment concept, keyframe concept, prop / vehicle design, and map / bird's-eye concept styles.
- Added dynamic recommendation rules: mode 2 should recommend only 2-3 style anchors that fit the current subject, instead of always showing the same A/B/C options.
- Preserved the strict realism behavior for `真实题材电影摄影风格`.

Validation score:

- Static validation: passed.

Remaining risk:

- Style-anchor choice still depends on the assistant's subject understanding; sample-output linting could be added later to verify the selected anchor is actually reflected in `【prompt】` and `PHOTOGRAPHIC TONE:`.

## 2026-06-18 Trained v7

Accepted improvements:

- Added a strict reference-image policy: images are color-and-style references by default, not content references.
- Reference-image prompts now extract only palette, material color behavior, shadow / light colors, and broad visual style cues unless the user explicitly asks to preserve content.
- Added explicit no-copy constraints for image subject, characters, buildings, props, composition, camera angle, layout, signs, logos, text, story, and exact scene content.
- Synchronized the rule into `cinematic_grader`, `scene_prompt_qa`, validation cases, scoring rubric, and static checks.

Validation score:

- Static validation: passed.

## 2026-08-02 Mode 1 Aesthetic-Enhanced v8

Accepted improvements:

- Reframed Mode 1 as high-quality automatic decision-making rather than a lower-quality shortcut.
- Added a progressive-disclosure Mode 1 workflow covering brief classification, aesthetic preset selection, compact role-based retrieval, visual-rule distillation, complete prompt generation, and silent QA.
- Added an empty top-aesthetic-library catalog that never blocks generation and forbids fabricated reference images, IDs, scores, presets, or observations.
- Defined six reference roles: overall, composition, lighting/value, color grade, materials, and negative example.
- Required one primary overall direction and dimension-locked auxiliary references to prevent mixed-style averaging.
- Added a silent quality gate for focal hierarchy, depth, lighting/value consistency, color discipline, material credibility, camera coherence, constraints, and fixed output structure; material failures trigger one complete internal rewrite.
- Kept internal library images separate from user-supplied reference images, so library retrieval cannot trigger 1:1 recreation or the reference-image output structure by itself.

Validation result:

- Static training checks: passed.
- Skill-creator quick validation: passed.
- Empty aesthetic catalog parse: passed.

Remaining risk:

- Personalized gains cannot be evaluated until the user supplies and labels real reference images.

## 2026-08-02 Aesthetic Library Seed v9

Accepted improvements:

- Added two user-approved source contact sheets and preserved the originals for provenance.
- Split the sources into six independent wide environment references so Mode 1 can retrieve by scene family and visual role instead of loading mixed contact sheets.
- Marked all six as gold-tier, internal-only aesthetic references with `PASS_WITH_NOTES` quality status.
- Added role assignments, scene families, view types, keep/avoid observations, borrowing constraints, source crops, dimensions, and integrity hashes.
- Prohibited direct model input because visible titles, UI-like text, or platform watermarks remain in the source artwork.
- Updated the no-match validation case so an active library cannot force unrelated outdoor fantasy or post-apocalyptic references into an indoor historical scene.

Validation result:

- Catalog TOML parse with two sources and six reference records: passed.
- Referenced-file existence, dimensions, and SHA-256 integrity checks: passed.
- Static training checks and skill-creator validation: passed.
- Independent compatible Mode 1 forward test: passed; the result adopted the gold reference's asymmetric colossal-rock scale, sea-level viewpoint, restrained cold grade, mist layering, and tiny-vessel focal hierarchy without reproducing titles, watermarks, or branded narrative content.

## 2026-08-16 Prompt Hygiene v10

Accepted improvements:

- Made the user brief the sole content authority and added a private `USER / REFERENCE / NECESSARY` fact ledger.
- Removed mandatory global positive and negative supplements that forced clean, sharp, noise-free commercial imagery into unrelated styles.
- Prohibited automatic film-source recommendations; text-only prompts now use direct color language unless the user supplies, requests, or approves one source.
- Limited Mode 1 automatic completion to necessary view, space, action, and implied light; prohibited decorative landmarks, props, characters, vehicles, weather, and backstory.
- Reduced photography/grading parameters to controls with visible consequences and made advanced metadata conditional.
- Required the camera body to appear exactly once and limited `Avoid:` to 3-6 likely scene-specific failures.
- Added prompt-hygiene regression cases for a character-led beach sparkler scene with a user-supplied film-tone source.

Validation result:

- Skill-creator quick validation: passed.
- Updated static training checks: passed.
- Independent Mode 1 no-source test: passed with direct color language and no automatic film source.
- Independent Mode 1 user-source test: passed after tightening necessary-inference rules; no decorative micro-details, fixed supplements, repeated camera body, or sensitive negative-vocabulary dump remained.
