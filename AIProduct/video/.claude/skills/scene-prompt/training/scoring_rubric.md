# scene-prompt Scoring Rubric

Score each generated response out of 100. Runtime outputs must not reveal this score.

## 1. Interaction Control - 10 points

- 4: Direct skill invocation asks the user to choose mode 1 / 2 / 3.
- 3: Does not generate a prompt before mode selection, unless mode is already selected in the same message.
- 3: Correctly follows the selected mode, including one-question-at-a-time guided interviewing for mode 2.

## 2. Narrative Pressure And Visual Traffic - 15 points

- 4: Character/subject relationship or subject-environment relationship is clear without inventing conflict.
- 4: Spatial pressure and audience position are physically justified.
- 4: The eye has a readable entry, interruption/redirection, focal landing, and unresolved exit.
- 3: These decisions are made before and explain the camera, lens, and composition.

## 3. Scene Composition And Completeness - 15 points

- 3: Macro geography or interior/exterior setting is explicit.
- 3: Foreground / middle ground / background are all present and have distinct jobs.
- 3: One primary focal anchor and at most two supporting anchors are clear.
- 3: Shot scale, camera height, angle, crop, negative space, and occlusion serve the composition task.
- 3: Style anchor, materials, and worldbuilding are usable, restrained, and consistent.

## 4. Color, Lighting And Value Logic - 15 points

- 3: Uses the correct conditional color section for reference-image or text-only mode.
- 3: Defines a dominant color body, supporting range, restrained accent, and physical color sources.
- 3: Color changes scene interpretation and avoids automatic blue-gray, teal-orange, or low-saturation treatment.
- 3: Lighting, exposure, atmosphere, and `Value map:` agree.
- 3: Any named source is user-approved, appears at most once, and affects only color/light/contrast/atmosphere/material response.

## 5. Physical Realism And Anti-AI Discipline - 15 points

- 3: Detail density is selective rather than uniformly rich or sharp.
- 3: Materials and light sources are physically credible; architectural structure and interior layout follow the selected real, historical, speculative, or explicitly impossible regime, with coherent support, circulation, adjacency, scale, access, and enabling rules.
- 3: One coherent capture/texture policy is used when relevant.
- 3: Dirt, grain, diffusion, bloom, wetness, smoke, and special effects are localized and motivated.
- 3: The result avoids glossy AI rendering, advertising polish, game-key-art drift, and generic concept-art staging when realism is requested.

## 6. Prompt Utility And Constraint Adherence - 25 points

- 5: Final prompt is copy-ready and entirely English, including all section headers and punctuation.
- 5: Includes a targeted `Avoid:` list of 3-6 likely failures, with `black-and-white or monochrome image` included unless the user explicitly requests a colorless result.
- 5: Contains no fixed positive/negative boilerplate, generic quality vocabulary, or unrelated negative terms.
- 5: States each visual fact once and stays concise enough that the focal hierarchy remains dominant.
- 5: Every detail is traceable to `USER`, `REFERENCE`, or `NECESSARY`; reference safety, revision locks, user texture overrides, and the fixed structure are preserved.

## 7. Camera Coherence, Revision Fidelity And Sequence Logic - 5 points

- 2: Camera body, lens, aperture, medium, exposure, movement, texture, and any film format/stock/print chain are compatible; the body appears exactly once and digital capture is not misrepresented as physical negative capture.
- 2: Revisions change only requested dimensions and return a complete prompt.
- 1: For multi-frame work, continuity holds, frames use different pressure/traffic functions, and sequence order weakens when shuffled.

## Pass / Fail

- 90-100: Strong accept.
- 82-89: Accept.
- 70-81: Rewrite before delivery.
- below 70: Fundamental failure; rebuild from the brief.

Any veto failure defined in `SKILL.md` requires rewriting regardless of the numeric result.
