# scene-prompt Training Pack

This folder contains a lightweight SkillOpt-style training pack for `scene-prompt`.

The goal is not to train a model directly. The goal is to iteratively improve `SKILL.md` using:

1. task cases,
2. expected behavior,
3. scoring rubric,
4. failure logging,
5. small bounded edits,
6. validation before accepting a new skill version.

## Files

- `train_cases.md`: examples used to discover failures and refine instructions.
- `validation_cases.md`: held-out examples used after each edit.
- `scoring_rubric.md`: 100-point scoring rubric.
- `failure_log.md`: append failures and chosen fixes here.
- `best_skill_notes.md`: record accepted skill versions and why they improved.

## Training Loop

1. Run several train cases using the current `SKILL.md`.
2. Score each output with `scoring_rubric.md`.
3. Log concrete failures in `failure_log.md`.
4. Edit `SKILL.md` with the smallest instruction change that fixes the repeated failure.
5. Run all validation cases.
6. Accept the edit only if validation passes and no new major regressions appear.

## Acceptance Bar

A skill version is acceptable when:

- every direct invocation asks for interaction mode unless the mode is already selected;
- mode 1 can produce a full prompt from a short phrase;
- mode 2 uses a guided interview one question at a time, includes recommendations in every question, and accepts `你推荐`;
- mode 2 asks for `风格锚定` as the second guided question;
- realistic cinematic style anchors force real-world physical, architectural, material, weather, lens, and production-design logic unless the user explicitly asks for fantasy or stylization;
- mode 3 searches the web for film still / art reference candidates;
- no-reference prompts use `Cinematic color tone:` with direct color language; a named source appears only when the user supplied, requested, or approved it and appears at most once;
- no-reference prompts include concise `Photography / grading parameters:` with lens / focal length, aperture / depth of field, white balance, exposure / contrast / highlight behavior, filtration, and grain / noise policy; color space, LUT, ISO, and shutter appear only when visibly or operationally relevant;
- reference-image prompts use `Color palette:`;
- every visible detail is traceable to the user brief, a user-approved reference, or a necessary spatial / physical inference;
- fixed positive / negative supplements, broad quality boilerplate, repeated facts, and long negative vocabulary dumps are forbidden;
- output remains easy to copy into image-generation tools;
- every final prompt strictly follows the fixed final output structure: `PROMPT:`, `Foreground:`, `Middle ground:`, `Background:`, `Lighting:`, `Value map:`, then one conditional color-control block (`Color palette:` for reference-image prompts, or `Cinematic color tone:` plus `Photography / grading parameters:` for text-only prompts), `PHOTOGRAPHIC TONE:`, `Avoid:`;
- `Avoid:` contains only 3-6 likely scene-specific failures and introduces no unrelated concepts;
- every final prompt ends with `Avoid:` and does not append a run-check list, notes, explanation, or QA report.
