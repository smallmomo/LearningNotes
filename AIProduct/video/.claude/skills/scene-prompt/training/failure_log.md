# scene-prompt Failure Log

Append failures in this format:

```text
Date:
Case:
Observed failure:
Likely cause in SKILL.md:
Smallest proposed edit:
Validation result:
Accepted:
```

## Initial Known Risks

Date: 2026-06-18
Case: global supplements vs older film grain defaults
Observed failure: older prompt style sometimes asked for film grain while global negative supplement rejects film grain.
Likely cause in SKILL.md: previous fixed quality anchor used `slight organic film grain`.
Smallest proposed edit: replace film-grain default with clean high-definition no visible film grain / digital noise.
Validation result: static search found no positive `film grain` defaults except no-grain wording and negative supplement.
Accepted: yes

Date: 2026-08-16
Case: fixed-template prompt contamination
Observed failure: a short character-led beach brief expanded into unrequested geography, props, story beats, repeated camera language, exhaustive technical metadata, fixed clean/high-definition supplements, and a long `Avoid:` vocabulary dump. The fixed sharpness and noise-free language also conflicted with diffusion and naturalistic film texture.
Likely cause in SKILL.md: mandatory global supplements, automatic cinematic-source selection, full grading metadata for every text prompt, unconstrained Mode 1 inference, and no traceability or redundancy gate.
Smallest proposed edit: make every detail traceable to `USER`, `REFERENCE`, or `NECESSARY`; remove fixed supplements; require direct color language unless a source is user-approved; condition advanced camera metadata on visible need; name the camera once; cap `Avoid:` at 3-6 items; add a prompt-hygiene validation case.
Validation result: updated static checks and skill-creator validation passed. Independent Mode 1 forward tests confirmed that an unreferenced deep-sea brief received no automatic film source or fixed supplements, and the film-tone beach brief retained only necessary space, action, light, one camera mention, concise parameters, and six targeted exclusions.
Accepted: yes

Date: 2026-06-18
Case: mode 2 form overload
Observed failure: mode 2 gave the user a full 12-field form, which was too hard to answer and lacked per-question recommendations.
Likely cause in SKILL.md: mode 2 instructions said to ask the user to fill the full form.
Smallest proposed edit: change mode 2 into a guided interview: ask one focused question at a time, include 2-3 concrete recommendations and a `你推荐` option, while still accepting a full form if the user provides one.
Validation result: static checks now require the one-question rule and reject old full-form validation wording.
Accepted: yes

Date: 2026-06-18
Case: missing style anchor
Observed failure: prompts could follow a subject and film tone but lack a hard visual style anchor, causing realistic subjects to drift into fantasy, sci-fi, illustration, or generic concept art.
Likely cause in SKILL.md: mode 2 asked for era/type instead of visual style anchor; no rule explained how a realistic cinematic style should constrain architecture, materials, lighting, and physical plausibility.
Smallest proposed edit: replace `时代 / 类型` with `风格锚定`, add `Style Anchor Rule`, and require realistic cinematic style to describe scenes according to real-world physical and production-design logic.
Validation result: static checks require style anchor rules and reject old `时代 / 类型` field.
Accepted: yes

Date: 2026-06-18
Case: reference image content copying
Observed failure: when a reference image is provided, prompts could accidentally copy the image's subject, composition, buildings, characters, text, or exact scene instead of only using the reference for color and style.
Likely cause in SKILL.md: reference-image logic said to extract Color palette but did not explicitly forbid content copying.
Smallest proposed edit: add reference-image rule that images are style-and-color references by default; extract only color palette and visual style cues unless the user explicitly requests content preservation.
Validation result: static checks require the style/color-only rule and no-subject-copy rule.
Accepted: yes

Date: 2026-06-18
Case: direct invocation
Observed failure: earlier versions generated a prompt immediately when the user invoked the skill with no mode.
Likely cause in SKILL.md: no explicit interaction gate.
Smallest proposed edit: add `Interaction Start` and `Interaction Structure`.
Validation result: manual invocation returned mode selection.
Accepted: yes

Date: 2026-06-18
Case: non-desert short phrases
Observed failure: fixed anchors still biased short prompts toward desert frontier and top-down aerial photography, which could harm prompts like deep sea, lunar base, old apartment interior, microscopic world, or magic castle.
Likely cause in SKILL.md: generation workflow said to infer from the 焚决 desert visual system for any short phrase; fixed anchors also stated top-down aerial as a general default.
Smallest proposed edit: make subject/genre the first inference source; reserve 焚决 desert defaults for desert/tribal/canyon/dune/sand-skiff/mechanical-beast briefs. Make camera and lighting subject-dependent instead of universally aerial/golden-hour.
Validation result: static rule review passed; validation cases V02, V03, and V04 no longer conflict with camera/lighting defaults.
Accepted: yes

Date: 2026-06-18
Case: film tone selection drift
Observed failure: text-only prompts could choose inconsistent films or accidentally name more than one film.
Likely cause in SKILL.md: no film-tone recommendation table.
Smallest proposed edit: add a `Film Tone Recommendation Guide` with one film per common scene family.
Validation result: static rule review confirms exactly-one-film rule and guide are both present.
Accepted: yes

Date: 2026-06-18
Case: final output structure drift
Observed failure: final outputs could use a newer generic structure or append a run-check list instead of the user's required `【prompt】 / Foreground / Middle ground / Background / Lighting / color / PHOTOGRAPHIC TONE / supplements / Avoid` structure.
Likely cause in SKILL.md: generation workflow required sections but did not define a fixed final-output template; training and validation still rewarded run-check lists.
Smallest proposed edit: add `Final Output Structure`, require exact section order with one conditional color-control block, make Chinese interpretation internal only, end with `Avoid:`, and remove run-check list requirements from validation, scoring, and reports.
Validation result: static checks passed after adding structure and anti-regression checks.
Accepted: yes

Date: 2026-08-02
Case: Mode 1 speed was framed as lower prompt accuracy
Observed failure: Mode 1 could be interpreted as a lower-quality shortcut and had no explicit path for using a curated aesthetic library, role-based references, or a silent art-direction quality gate.
Likely cause in SKILL.md: Mode 1 emphasized speed and automatic completion but did not define a personalized aesthetic retrieval/distillation workflow or empty-library behavior.
Smallest proposed edit: define Mode 1 as a high-quality automatic-decision mode; add a role-based aesthetic reference bundle, dimension-locked distillation, silent QA with one internal rewrite, and a non-blocking empty-library fallback.
Validation result: static training checks passed; skill-creator quick validation passed; the empty TOML catalog parsed successfully and contains no reference records.
Accepted: yes
