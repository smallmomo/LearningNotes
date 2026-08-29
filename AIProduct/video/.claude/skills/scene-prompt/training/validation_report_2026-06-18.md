# scene-prompt Validation Report - 2026-06-18

## Summary

Version: trained v4

Static check: passed

Manual score: 98 / 100

Verdict: accepted

## Case Scores

### V01 - Empty Invocation

Score: 100 / 100

Pass:

- Direct invocation is explicitly gated by `Interaction Start`.
- The mode-selection question is mandatory unless mode 1, 2, or 3 is already selected.
- No prompt should be generated before mode selection.

### V02 - Simple Prompt With No Reference

Score: 96 / 100

Pass:

- Mode 1 supports short phrase generation.
- Text-only prompt uses `Cinematic color tone:`.
- Exactly-one-film rule is explicit and requires `《...》` formatting.
- `Photography / grading parameters:` is mandatory for text-only prompts.
- Positive and negative supplements are mandatory.
- Fixed final output structure is mandatory.
- Final output must end with `Avoid:` and must not append a run-check list.

Minor risk:

- Actual film choice is instruction-guided, not automatically linted from a produced sample.

### V03 - Detailed Prompt Form

Score: 95 / 100

Pass:

- Mode 2 uses a guided interview one question at a time.
- Each Mode 2 question includes practical recommendations and accepts `你推荐`.
- The assistant should fill gaps rather than ask another round.
- Exactly-one-film rule applies with `《...》` formatting.
- Professional photography / grading parameters are mandatory.

Minor risk:

- Some field recommendations depend on assistant judgment.

### V04 - Reference Image Color Logic

Score: 92 / 100

Pass:

- Reference image prompts use `Color palette:`.
- Text-only `Cinematic color tone:` is not used for reference-image prompts unless requested.
- Role-wise color extraction is specified.

Remaining risk:

- Color extraction is instruction-based and visual, not a scripted pixel sampler.

### V05 - Super Detailed Mode

Score: 92 / 100

Pass:

- Mode 3 requires staged questions.
- Mode 3 requires web search for movie still / production design references.
- User must choose exactly one film before final prompt generation.

Remaining risk:

- Web quality and availability can vary.
- Need live source links during actual execution.

## Rubric Breakdown

Interaction Control: 20 / 20

Scene Completeness: 19 / 20

Color Logic: 19 / 20

Prompt Utility: 19 / 20

Constraint Adherence: 20 / 20

Total: 98 / 100

## Accepted Edits

- Replaced universal desert inference with subject-first inference.
- Replaced universal aerial/golden-hour defaults with scene-goal camera and lighting selection.
- Added one-film `Film Tone Recommendation Guide`.
- Required `Cinematic color tone:` film titles to use `《...》`.
- Added mandatory `Photography / grading parameters:` with color space, LUT, color temperature, exposure, lens, aperture, ISO, shutter angle, diffusion / filtration, and sharpening / noise policy.
- Preserved global positive and negative supplements.
- Preserved Color palette vs Cinematic color tone split.
- Added fixed final output structure matching the user's required format.
- Removed run-check list as a final-output requirement.
- Required final outputs to end with `Avoid:` without trailing notes, explanations, or QA reports.

## Next Training Targets

- Add sample outputs for each validation case.
- Build a lint script for generated sample outputs.
- Add a film-tone reference table with Chinese film titles and English film titles.
- Add more reference-image validation cases for interiors, cyberpunk, snow, and old apartment scenes.
