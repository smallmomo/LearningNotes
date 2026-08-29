# Mode 1 Aesthetic Enhancement

Use this reference only for Mode 1. The user should still experience a short, fast interaction; all retrieval, distillation, and QA below are internal.

## Runtime Pipeline

1. Parse the user's brief.
2. Classify the scene family and intended use.
3. Select one primary aesthetic preset.
4. Read `aesthetic-library.toml` and retrieve a compact role-based reference bundle when real matching entries exist.
5. Distill the bundle into executable visual rules.
6. Build a `USER / REFERENCE / NECESSARY` fact ledger and reject any untraceable content.
7. For narrative or dominant subject-environment scenes, decide relationship state, spatial pressure, audience position, and one visual-traffic path before camera and lens selection.
8. Define one color thesis with a dominant body, supporting range, restrained accent, physical sources, and perceptual purpose.
9. If the user requests film or a film medium materially serves the brief, read `film-stock-selection.md` and choose a coherent physical-film or digital-emulation chain. Do not add film merely because the brief says `cinematic`.
10. Generate the complete prompt in the fixed final structure.
11. Run the silent aesthetic, technical, anti-AI, and prompt-hygiene quality gate, then apply the 100-point threshold.
12. If the draft scores below 82, triggers a veto failure, or contains prompt contamination, rewrite the complete prompt and rescore; otherwise deliver it.

Do not narrate these steps to the user and do not append retrieval or QA notes to the final prompt.

## Empty Library Behavior

The catalog may contain no user-supplied images. In that state:

- Do not fabricate references, IDs, presets, tags, scores, visual observations, or pairwise results.
- Do not ask the user for images during an ordinary Mode 1 generation request.
- Fall back to the main skill's style-anchor, direct color treatment, camera selection, value-map, material realism, and final QA rules. Do not insert a named cinematic source unless the user supplied or approved one.
- Preserve the same final quality target. Empty library means no personalized visual calibration, not permission to simplify the prompt.

## Reference Bundle

Retrieve at most six relevant references. Prefer fewer strong references over filling every slot.

1. `overall`: one primary image that owns the overall aesthetic direction and completion standard.
2. `composition`: one image for framing, focal placement, negative space, camera height, and foreground/middle-ground/background organization.
3. `lighting_value`: one image for key-light direction, contrast, haze, exposure, highlight ceiling, and grayscale hierarchy.
4. `color_grade`: one image for saturation discipline, warm/cool separation, shadow temperature, highlight color, and atmospheric color.
5. `materials`: one image for surface roughness, age, reflectance, moisture, construction logic, and physical credibility.
6. `negative`: one rejected or low-ranked image whose recorded failure should be explicitly prevented.

Never let an auxiliary reference control dimensions outside its assigned role. Never average multiple overall styles. If no valid `overall` entry exists, use the strongest relevant style anchor from the main skill and use library entries only for their recorded specialist roles. Library entries may not introduce subjects, props, geography, architecture, costumes, composition, or story content.

## Selection Order

Apply hard compatibility filters first:

- scene family and intended use;
- indoor versus outdoor;
- outdoor human view, semi-bird's-eye, or bird's-eye when applicable;
- photography, live-action production design, 3D, animation, illustration, or concept-art style family;
- user-specified aspect ratio, period, realism level, time of day, and exclusions.

Then rank compatible entries by:

1. role match;
2. semantic relevance to the subject;
3. gold-tier status and pairwise win rate;
4. agreement with the user's explicit style and mood;
5. usefulness without duplicating another selected reference.

Do not select an aesthetically strong image that conflicts with a hard scene constraint.

## Distillation Card

Before writing the prompt, silently create one compact internal card:

```text
Primary direction: [one coherent aesthetic direction]
Composition: [camera, focal placement, depth layers, negative space]
Pressure and traffic: [relationship state, spatial force, audience position, eye entry, interruption, landing point, unresolved exit]
Space: [macro geography or interior organization, scale, paths, occlusion]
Lighting and value: [key light, exposure, haze, V1-V5 placement]
Color thesis: [dominant body, supporting range, restrained accent, physical sources, narrative/perceptual effect]
Materials: [surface behavior, age, moisture, realism, construction]
Camera: [one body, lens, aperture, depth of field, perspective, physical-film or digital-emulation mode, format/stock/print chain when applicable, one coherent texture policy]
Avoid: [user exclusions plus relevant negative-reference failures]
```

Translate the card into the normal fixed prompt sections. Do not output this card as an extra section.

Keep the card content-minimal. Every item must come from the user brief, an approved reference role, or a necessary spatial/physical inference. Do not add a field merely because the card contains a slot for it.

## User Reference Boundary

Internal aesthetic-library references and user-supplied references are different inputs:

- A user-supplied image follows Mode 1 `原创改写 / 1:1复刻` rules and controls whether the final prompt uses `Color palette:`.
- A library image is an internal taste-calibration resource. Unless it is explicitly attached to the generation task, it does not switch the output to the reference-image structure and does not authorize 1:1 content or composition copying.
- An explicit user reference or instruction always outranks the library.

## Silent Quality Gate

Check the complete draft against all items below:

- The first sentence states the correct space type, view type when outdoor, style anchor, subject, and camera language.
- One clear focal hierarchy exists; the scene is not uniformly detailed or uniformly bright.
- Relationship pressure, spatial pressure, audience position, and visual traffic agree with the brief when the scene is narrative or has a dominant subject-environment relationship.
- Foreground, middle ground, and background match the selected camera and form readable depth.
- Macro geography or interior organization is physically plausible.
- Visible architecture and interiors match the inferred reality regime: real and historical scenes use credible structure, circulation, room adjacency, scale, and period/typology; science-fiction and fantasy use one internally consistent enabling rule instead of arbitrary structural combinations; impossible layouts appear only when explicitly requested.
- Lighting direction, exposure, haze, and the `Value map:` agree.
- The grayscale hierarchy produces strong focal contrast with restrained highlights.
- Color treatment uses one coherent source or palette, states a physically motivated color thesis, avoids uncontrolled saturation, and does not default to blue-gray or teal-orange without cause.
- Materials have believable roughness, age, reflection, moisture, and construction behavior.
- Detail and imperfection are selective rather than globally sharp, glossy, dirty, wet, smoky, bloomed, or over-designed.
- Camera body, lens, aperture, ISO, shutter, and depth of field do not contradict the scene.
- If film is used, camera body, format, capture stock, dominant light, sensitivity, exposure, grain, and optional print-film emulation form one physically coherent chain; digital capture is not falsely described as physical negative capture.
- Worldbuilding details support the focal subject rather than creating decorative clutter.
- Positive and negative instructions do not contradict each other.
- No fixed positive or negative quality supplement appears.
- Every visible detail is traceable to `USER`, `REFERENCE`, or `NECESSARY`; named styles and cameras have introduced no visible content.
- A cinematic source appears only when user-approved and affects only color, light, contrast, atmosphere, or materials.
- Technical parameters without visible consequences and repeated descriptions have been removed.
- `Avoid:` contains only 3-6 likely scene-specific failures and no broad vocabulary dump.
- Unless the brief explicitly requests black-and-white, monochrome, grayscale, or another colorless treatment, `Avoid:` includes `black-and-white or monochrome image` as one of those 3-6 items; omit it for an explicitly colorless brief.
- User constraints and library-derived avoid rules are present.
- The fixed output structure is complete, English only, and ends at `Avoid:`.

Apply the main skill's private 100-point weighting and 82-point threshold. Treat missing required sections, contradictory camera/light logic, weak focal hierarchy, collapsed depth, incoherent mixed style, plastic material drift, untraceable invented content, generic glossy AI rendering, physically unjustified effects, fixed boilerplate, excessive negatives, redundant phrasing, or violations of explicit constraints as material or veto failures. Rewrite the complete prompt once, preserving the user's brief and all valid decisions, then rescore. Do not expose the score, failed draft, rewrite note, or QA report.

## Feedback Loop

When the user later ranks generated images or marks a result as gold, acceptable, or rejected, preserve that feedback for future catalog updates only when the user asks to add it to the library. Pairwise results are more valuable than isolated scores. Do not mutate the catalog merely because the user comments on an image during an ordinary revision.
