---
name: scene-prompt
description: 将一句话、关键词或参考图扩写为高质量英文场景提示词，先判断人物或主体关系、空间压力、观众位置和视线流量，再决定机位、焦段与构图；同时校验建筑结构与室内布局的现实或世界观合理性，建立叙事性色彩命题、按光源与画幅选择的胶片/印片系统、反 AI 摄影质感和 100 分质量门槛。Use when the user asks for scene prompts, environment prompts, architectural or interior scenes, cinematic locations, cinematic stills, film-stock selection or emulation, aerial environments, multi-shot or triptych scene prompts, GPT-Image-2 prompts, or worldbuilding scenes.
---

# Scene Prompt

Turn a short location idea, scene brief, or reference image into a copy-ready environment prompt. The skill supports realistic photography, cinematic production design, 3D rendering, animation backgrounds, concept art, and the 焚决/万物生 desert world when the brief calls for it.

## Non-negotiable rules

- Final prompt deliverables must be English only, including section headers. Chinese is allowed only for mode selection, questions, clarification, and revision discussion.
- A final prompt must use the fixed structure below and end at `Avoid:`. Do not append explanations, QA notes, or a Chinese summary.
- Establish geography, spatial organization, focal hierarchy, depth layers, lighting, value structure, camera behavior, materials, and exclusions only at the resolution needed by the brief. Character-led scenes need functional environment context, not environment-level worldbuilding density.
- Judge the scene's reality regime before designing architecture or an interior. Real-world and historical scenes must use credible structural systems, construction methods, circulation, room adjacency, scale, access, and period-appropriate combinations. Science-fiction and fantasy may introduce speculative materials, technology, gravity, or magic, but the enabling rule and its consequences must remain internally consistent. Allow physically impossible or nonfunctional combinations only when the user explicitly requests surreal, dreamlike, abstract, or impossible space.
- Do not invent a specific aspect ratio unless the user gives one or a reference image requires matching it.
- Use physically plausible photography or production design. Avoid generic game-map, flat illustration, empty matte-painting, and glossy AI-render language unless explicitly requested.
- Choose one primary cinema camera body. Never list competing bodies.
- For character-led, creature-led, vehicle-led, ritual, confrontation, or multi-subject scenes, decide the relationship pressure, spatial pressure, audience position, and visual traffic before choosing shot scale, focal length, camera body, or composition pattern.
- Give every text-only scene a one-sentence color thesis: one dominant color body, one supporting range, at most one accent, their physical sources, and the narrative effect. Do not default to blue-gray gloom, teal-orange grading, or uniformly low saturation.
- Unless the user explicitly requests black-and-white, monochrome, grayscale, or another colorless treatment, treat the deliverable as a color image and include `black-and-white or monochrome image` in `Avoid:`. Count it within the 3-6-item limit. When the user explicitly requests a colorless treatment, omit this exclusion and design the value and material separation for monochrome output.
- Treat film as an optional capture or finishing decision, not a synonym for `cinematic`. Use at most one capture stock plus one optional print-film emulation, keep the camera/format/light chain physically compatible, and name a stock only when its color, contrast, highlight, grain, or exposure behavior has a visible purpose.
- Treat the user brief as the sole content authority. Every generated detail must be traceable to the brief, a user-approved reference, or the minimum spatial and physical information required to make the image coherent.
- Never append fixed positive or negative boilerplate. Do not force clean high-definition, crisp edges, film grain, dirty texture, HDR, CGI, or any other quality vocabulary unless the requested style visibly requires it.
- State each visual fact once in the section where it has the greatest control value. Remove repeated descriptions, decorative synonyms, and technical parameters without visible consequences.
- Keep `Avoid:` targeted to 3-6 likely failure modes. Do not dump broad style vocabularies, unrelated sensitive terms, or every possible artifact into the prompt.
- Silently score the complete draft out of 100. Do not deliver below 82; rebuild the complete prompt before delivery and never expose the score or QA notes in the final prompt.

## Interaction Start

If the user has not selected mode 1 / 2 / 3, ask:

```text
请选择 scene-prompt 的交互模式：

1. 简单描述：给一句话或几个关键词，我自动补全并输出高质量 prompt。
2. 详细描述：我一次问一个关键条件，你可以选择选项或说“你推荐”。
3. 超级详细聊天：一起确定方向，并在条件明确后寻找影视、动画或游戏 CG 视觉参考。
```

If a mode is already selected, continue without repeating this question.

### Required space gate

Unless already clear, ask whether the scene is indoor or outdoor. For outdoor scenes, also confirm the view:

```text
这个场景是室内还是室外？
A. 室外，适合城市、港口、山谷、营地、荒野等大环境，推荐。
B. 室内，适合房间、殿堂、实验室、船舱、工坊等空间。
C. 你推荐。
```

For outdoor scenes:

```text
室外画面想用哪种视角？
A. 人视图，沉浸感强。
B. 半鸟瞰，兼顾布局和前中后景，推荐。
C. 鸟瞰图，适合城市、营地、港口和大范围布局。
D. 你推荐。
```

For indoor scenes, use eye-level interior wide shot, corridor view, room-scale wide shot, low-angle hall view, or another suitable interior camera; do not ask for an outdoor view.

## Modes

## Mode 1 Aesthetic Enhancement

Mode 1 keeps interaction short but uses the same final quality standard as the other modes. Read `references/mode1-aesthetic-enhancement.md` and, when relevant, `references/aesthetic-library.toml`. If a material failure is found, rewrite the complete prompt once before delivery.

### Mode 1: simple brief

Infer missing conditions conservatively and keep interaction short. Infer only the view required by the subject, the minimum spatial setting, one decisive action state, and lighting directly implied by the brief. Do not invent named landmarks, extra characters, vehicles, props, weather, backstory, costume details, distant architecture, or decorative micro-details such as footprints, shells, debris, puddles, signs, and background lights merely to make the prompt feel complete.

For Mode 1, target roughly 250-450 English words. Exceed 550 words only when the scene is structurally complex or the user requests a production-level specification. If a reference image is supplied, ask once:

```text
模式 1 想怎么使用这张参考图？
1. 原创改写：借用色彩、光线、材质和氛围，但重新设计主体、构图和空间，推荐。
2. 1:1 复刻：尽量匹配参考图可见的主体、构图、镜头、前中后景、光线和比例。
```

For original rewrite, never copy the reference's subject arrangement, composition, camera, buildings, props, story, text, logos, or exact layout. For 1:1 recreation, inventory the visible frame geometry, crop, camera height, lens feel, object placement, occlusion, depth order, lighting direction, surface condition, color hierarchy, and value hierarchy. Describe only visible or strongly inferable content.

Before generating, silently run the visual and technical gate. If the prompt has a material contradiction or missing required block, rebuild it once.

## Style Anchor Rule

Select and carry one style anchor through the prompt. Use realistic cinematic photography for real places and landscapes; architecture photography or architectural visualization for built spaces; high-end film production design or epic environment concept for imaginary worlds; practical sci-fi/fantasy production design for speculative worlds; PBR realistic 3D for clean renders; animation background or game concept art only when requested. A style anchor controls rendering language, color, light, contrast, atmosphere, and material behavior; it must not introduce subjects, props, architecture, geography, costume, composition, or story content. For Mode 2, ask the style question using the Chinese label `风格锚定`, recommend 2–3 suitable choices, and include `你推荐`. Do not always show the same A/B/C choices.

Style anchor library examples: `真实题材电影摄影风格` (按现实来描述), `建筑摄影风格`, `真实历史剧影视置景风格`, `史诗电影大场景风格`, `科幻电影实拍风格`, `PBR 写实 3D 渲染风格`, `建筑可视化 Archviz 风格`, `国风水墨意境风格`, `新闻摄影 / Photojournalism 风格`, `街头摄影风格`, `天文摄影 / 深空摄影风格`, `水下摄影风格`, `赛博朋克电影实拍风格`, `恐怖电影环境摄影风格`, `等距 3D / Isometric 风格`, `NPR 非真实感 3D 渲染风格`, `水彩插画风格`, `像素艺术风格`, and `关键帧概念图风格`.

### Mode 2: guided interview

Ask one short question at a time. Use this order, stopping when enough information is known:

1. Scene subject and intended use.
2. Indoor/outdoor, then outdoor view if applicable.
3. Style anchor.
4. Subject relationship, spatial pressure, audience position, visual-traffic path, composition task, focal anchor, gaze or movement direction, camera position, and depth layers.
5. Focal subject and worldbuilding.
6. Life signs: people, animals, vehicles, fires, smoke, tools, or none.
7. Time, key light, atmosphere, and mood.
8. Capture medium and film stock only when the user requests film or the choice materially changes the result.
9. Value map: recommend dark foreground, midtone environment, and brightest focal subject.
10. Elements to avoid.

Every question should include 2–3 useful recommendations and a `你推荐` option. Stop asking once the scene can be written without risky assumptions.

Recommended style choices should fit the subject: realistic cinematic photography, architecture/landscape photography, high-end film production design, epic environment concept, practical sci-fi/fantasy production design, PBR realistic 3D, animation background, or game concept art.

## Rework and Revision

Treat every delivered prompt as locked. On revision, change only the requested dimension and return the complete prompt, never a diff. Preserve all unmentioned camera, crop, composition, object placement, depth, lighting, palette, value codes, and exclusions. For a removal, delete only the named element; do not fill the space or rebalance the composition.

### Mode 3: detailed conversation

Use natural conversation, one creative point per turn. Confirm indoor/outdoor and view early. After the direction is clear, search for 2–3 relevant film still, TV still, animated feature, game CG, or production-design references when browsing is available. Recommend one visual-source tone and ask the user to choose one. Use that source only for color, lighting, contrast, atmosphere, and material behavior; never copy its copyrighted composition or content unless the user supplied and selected 1:1 recreation.

## References and progressive disclosure

Read only what the current task needs:

- `references/mode1-aesthetic-enhancement.md`: required for Mode 1 internal aesthetic selection and QA.
- `references/aesthetic-library.toml`: read for Mode 1 when compatible library entries may help. Never invent entries; an empty or irrelevant library is a silent fallback.
- `references/desert-aerial-scenes.md`: read for desert, tribal frontier, canyon, dune, encampment, sand-skiff, mechanical-beast, or aerial settlement scenes.
- `references/cinematic-pressure-and-anti-ai.md`: read for realistic or cinematic photography, character/relationship pressure, anti-AI correction, lens-texture calibration, controlled imperfection, special lens/light inserts, or any multi-shot/triptych request.
- `references/film-stock-selection.md`: read whenever the user requests film, analog texture, a named stock, print-film emulation, 16mm/35mm/65mm capture, or when selecting a film medium would materially affect a realistic cinematic brief. Do not read or apply it merely because the user says `cinematic`.
- `references/cinematic-example-matrix.md`: read when generating several variants, random tests, a multi-shot sequence, or an unfamiliar scene family. Use it only as a diversity and failure-diagnosis matrix; never borrow its subjects, props, layouts, or story clues unless the user asked for them.
- Training files are for skill development and validation, not ordinary prompt generation.

For library use, select at most six role-based references: overall, composition, lighting/value, color grade, materials, and negative example. One overall direction controls the look; auxiliary references control only their assigned dimension. Do not average unrelated styles or let internal library images trigger reference-image mode. Skip the library entirely when no entry passes the scene-family, space, view, realism, and intended-use filters. Library references may calibrate only their assigned visual dimension and may never add visible content to the scene.

## Generation workflow

Parse the brief into: explicit user constraints, location, indoor/outdoor space, view, focal subject, subject relationships, spatial pressure, audience position, visual-traffic path, necessary geography or architecture, spatial hierarchy, requested signs of life, time/weather only when specified or physically implied, lighting, mood, style anchor, color thesis, camera, value map, physical-film versus digital-emulation mode, film format/stock/print stage when applicable, capture substrate or texture policy, and a short avoid list.

### Architectural and interior plausibility gate

Apply this gate whenever a built structure or interior is visible. Keep it internal unless the user asks for the reasoning.

1. **Classify the reality regime:** real-world/current, historical, science-fiction, fantasy, or explicitly surreal/impossible. Do not infer that a visually stylized scene is structurally fantastical.
2. **Check structural logic:** make walls, columns, beams, floors, roofs, openings, spans, foundations, and material behavior form a believable support and enclosure system for the selected regime. Reject unsupported masses, contradictory material spans, columns passing through required openings, and roof-wall-floor combinations with no plausible connection.
3. **Check functional layout:** make entrances connect to circulation; doors, corridors, stairs, ramps, lifts, windows, rooms, and exterior edges lead somewhere coherent. Preserve usable clearances, human scale, room function, privacy, access, and egress when relevant. Do not invent decorative rooms or impossible adjacencies merely to enrich the image.
4. **Check period and typology:** for real or historical architecture, use combinations that exist or are credible for the location, period, climate, building type, and construction technology. Do not create arbitrary hybrids of unrelated architectural systems or anachronistic interiors unless the user requests them.
5. **Check speculative rules:** for science-fiction or fantasy, identify the smallest user-supported technology, material, gravity, creature-scale, or magic rule that makes the design possible, then apply it consistently to support, access, circulation, maintenance, habitation, and visual evidence. Genre labels alone do not authorize random combinations.
6. **Exception:** allow deliberate non-Euclidean, dream, symbolic, abstract, or impossible architecture only when explicitly requested; make the impossibility readable as the concept rather than an accidental layout error.

For wide environments, make the foreground, middle ground, and background visibly different. For cities, ports, camps, settlements, battlefields, and large layouts, prefer semi-bird's-eye or bird's-eye. For character-led scenes, prefer human view. For rooms, use an interior view.

Do not invent objects to populate a required section. When a depth layer contains no meaningful user-driven object, describe only its spatial, atmospheric, lighting, or negative-space function. In Mode 1, keep each top-level section to one or two compact sentences.

The first sentence under `PROMPT:` must directly describe the scene and include the selected space/view, camera body, style anchor, and focal hierarchy. Do not begin with meta-language such as “recreate the reference.”

### Prompt hygiene gate

Before drafting, build a private fact ledger with three labels only: `USER` for explicit instructions, `REFERENCE` for visible or user-approved reference evidence, and `NECESSARY` for the smallest inference without which the scene would become spatially incoherent, physically impossible, or compositionally unreadable. A detail is not `NECESSARY` merely because it is plausible, attractive, cinematic, or commonly found in that location. Do not write any detail that cannot receive one of these labels.

Before delivery, remove contamination in this order:

1. Delete content introduced only by a genre, style name, camera, internal library image, or familiar example.
2. Delete repeated facts and keep the strongest concrete wording once.
3. Delete technical metadata that does not change a visible result.
4. Resolve conflicts between sharpness, diffusion, grain, cleanliness, exposure, depth of field, and rendering style instead of listing both sides.
5. Replace long negative vocabulary with positive scene control where possible; keep only 3-6 likely failures in `Avoid:`. For children, teenagers, or other sensitive subjects, state age-appropriate, ordinary, non-glamour presentation positively in `PROMPT:` and do not enumerate sexual or fetish vocabulary in `Avoid:` unless the user explicitly requires a safety exclusion.
6. For every prompt not explicitly requested as black-and-white, monochrome, grayscale, or colorless, reserve one `Avoid:` item for `black-and-white or monochrome image`. Do not add that item when monochrome output is requested.
7. Verify that a named visual source changes only color, light, contrast, atmosphere, or material response and contributes no recognizable content or composition.

If removing a sentence leaves the intended image unchanged, omit it.

### Narrative pressure and visual traffic

Complete this decision chain before selecting the lens or camera body. Keep it internal unless the user asks for analysis.

1. **Relationship state:** Identify who or what has agency, who is observed, obstructed, delayed, excluded, approached, protected, or made small. For environment-led scenes, define the relationship between the focal subject and the dominant landform, architecture, route, weather system, or institutional space.
2. **Spatial pressure:** Identify the physical structure that creates the scene's tension or meaning: distance, enclosure, scale imbalance, blocked access, exposed terrain, axial authority, crowd pressure, surveillance, unstable footing, or another brief-supported force.
3. **Audience position:** Place the viewer inside the action, outside it, on the wrong side of a barrier, behind another subject, above as an observer, low and vulnerable, inside a vehicle/device/reflection, or at a neutral geographic overview. Choose only a position that the scene can physically justify.
4. **Visual traffic:** Write one private sentence: `The eye enters through A, is slowed, redirected, or blocked by B, lands on C, and exits through D with E unresolved.` Use real bodies, paths, architecture, light, contrast, motion, reflection, occlusion, or negative space. Do not reduce this to a rule-of-thirds template.
5. **Decision lock:** Only after the four decisions agree, choose composition task, focal hierarchy, shot scale, camera height, lens, aperture, medium, and camera body. If the camera position cannot be explained by the relationship and space, redesign it.

For a scene with no people, do not invent a human conflict. Translate relationship pressure into access, scale, route, exposure, obstruction, destination, decay, or environmental dominance. For a purely technical, product, catalog, diagrammatic, or intentionally non-narrative brief, keep the chain minimal and prioritize functional clarity.

### Composition decision method

Do not choose composition from habit, a style label, or a camera body. Complete the narrative-pressure chain first, then confirm one composition before selecting the lens and camera system, using this order:

1. **Composition task:** Identify what the frame must communicate at first glance: geography, scale, access route, confrontation, discovery, isolation, ritual, danger, or another single dominant task. For a narrative brief, select one decisive instant rather than combining sequential actions.
2. **Primary focal anchor:** Name the first visual anchor precisely, such as a character's visible eye and expression, a doorway, altar, tower, vehicle, creature, fire, or illuminated architectural mass. Assign at most two supporting anchors and keep the environment subordinate to the primary anchor.
3. **Frame and view:** Follow the user's aspect ratio or reference ratio; otherwise do not invent one. Choose human view, interior view, semi-bird's-eye, or bird's-eye according to the information the image must reveal, not merely the scene category.
4. **Subject placement and directional space:** Place the focal subject according to gaze, movement, path direction, architecture, and intended tension. Normally leave lead room in front of a gaze, moving subject, entering vehicle, road, or visual flow. Let a gaze or movement press toward the frame edge only when confinement, collision, surveillance, or unease is the intended effect.
5. **Shot scale, camera height, and angle:** Choose the closest framing that still preserves all essential information. Use a closer human-scale frame when expression or action is primary; use a wider or elevated frame when layout, geography, routes, or scale is primary. State eye level or altitude, viewing direction, tilt, and whether the horizon is level.
6. **Depth construction:** Give foreground, middle ground, and background distinct jobs. Use foreground for scale, framing, or motivated occlusion; middle ground for the focal action or spatial hub; background for destination, geography, atmosphere, or consequence. Never add foreground blockage that hides the primary anchor without narrative purpose.
7. **Balance, negative space, and value hierarchy:** Give empty space a function such as gaze room, travel direction, isolation, threat, or environmental scale. Place the strongest local contrast, cleanest silhouette separation, or brightest restrained highlight at the focal anchor. Use symmetry, central framing, thirds, diagonals, or imbalance only when they serve the composition task.
8. **Composition lock:** Verify that the eye enters, changes speed or direction, reaches the primary anchor, follows a readable secondary path, and leaves through a motivated unresolved area. Confirm that the spatial relationship is understandable without explanation. Then lock crop, subject placement, camera position, depth order, and occlusion before choosing focal length, aperture, medium, and camera body.

For character-led scenes, prioritize the visible expression or action anchor, then the key prop or relationship, then the environment. For environment-led scenes, prioritize one dominant landform, architectural mass, settlement hub, or route network and use paths, light, scale figures, and overlapping planes to guide the eye toward it. Do not default to rule-of-thirds placement: centered symmetry suits ritual, monumentality, authority, or confrontation; asymmetric placement suits direction, anticipation, imbalance, or discovery.

In Mode 1, infer this sequence silently and commit to one clear composition. In Mode 2, ask only for the missing composition decision that would materially change the frame. In Mode 3, discuss the composition task and focal hierarchy before searching for visual references. A visual source may guide color, light, contrast, atmosphere, and material behavior, but must not decide or overwrite the composition unless the user supplied a reference and selected 1:1 recreation.

### Color thesis

Before writing `Color palette:` or `Cinematic color tone:`, define one private sentence that states:

- the dominant color body covering most of the scene;
- the supporting material, ambient, or shadow range;
- at most one focal accent;
- the physical source of each color in surfaces, wardrobe, vegetation, sky, water, practical lights, weather, reflected light, or the selected rendering medium;
- how the color relationship changes the viewer's reading of the scene.

Prefer color structure over filter labels. Vary color logic according to the brief: high-key institutional pastels, sun-faded earth and oxidized accents, warm practical light invaded by cool daylight, monochrome material separation, bright natural primaries under restrained exposure, or another physically motivated system. Do not automatically convert serious scenes into blue-gray desaturation, teal-orange contrast, rain, night, or dirty green.

### Reference-image color logic

When a user reference image is supplied, use `Color palette:` and extract dominant environment colors, material colors, accent colors, shadow/light colors, broad color discipline, and the reference-supported color thesis. In original rewrite mode, change content and composition. In 1:1 mode, preserve visible structure and match the reference's value hierarchy. Exclude text, logos, watermarks, compression artifacts, and accidental objects.

### Text-only color logic

Without a user reference image, omit `Color palette:` and use `Cinematic color tone:` followed immediately by `Photography / grading parameters:`. Express the color thesis concretely in `Cinematic color tone:` rather than naming a generic mood or grade.

Name a visual source only when the user explicitly supplies it, asks for a recommendation, or approves one during Mode 3. Use at most one source in ASCII quotation marks with attribution, and restrict it to color, lighting, contrast, atmosphere, and material response. Never select a default film merely because the scene belongs to a familiar genre. When no source is user-approved, describe the color treatment directly without naming any film, series, game, artist, or studio.

Keep `Photography / grading parameters:` limited to controls with visible consequences. Name the camera body exactly once in the final prompt, normally in the first `PROMPT:` sentence; do not repeat it in this parameter block or `PHOTOGRAPHIC TONE:`. Include one compatible lens or lens character, focal length, aperture and depth of field, white balance or dominant color temperature, exposure/contrast/highlight behavior, filtration, and grain/noise policy. Add color space, LUT, ISO, shutter, or frame-rate details only when the user requests a grading recipe or when low light, motion, high-speed capture, or a specific production workflow makes them materially relevant.

### Film-stock selection

Read `references/film-stock-selection.md` before naming any stock or print emulation.

1. Decide whether the result is physical film capture, digital capture with print-film emulation, or no film treatment. Do not describe a digital camera as physically captured on a film negative.
2. Select format before grain behavior: 65mm for exceptional monumental scale, 35mm for the default narrative film base, or Super 16 for intentionally softer and more visibly grain-led immediacy.
3. Select the capture stock from the dominant light and required sensitivity, not from genre prestige. Use one stock only; add at most one print-film emulation when a denser theatrical finish is visibly useful.
4. Translate every named stock into visible color response, contrast, highlight density, grain scale, and exposure behavior. A stock name alone is insufficient control.
5. Do not automatically add scratches, dust, light leaks, date stamps, heavy halation, chromatic fringing, expired-film shifts, or frame borders. Treat each as a separate motivated imperfection.
6. Put the exact stock/format/print chain only in `Photography / grading parameters:`. Describe its visible effect without repeating the stock name in `Cinematic color tone:` or `PHOTOGRAPHIC TONE:`.

User-specified film choices outrank automatic recommendations. A user-approved film or visual source controls color/light/contrast/atmosphere; the selected stock only implements those qualities and may not import composition or content. For clean 3D, animation, illustration, architectural visualization, technical, or product-render tasks, omit film unless the user explicitly requests a film emulation.

### Camera selection

Determine the camera system in this order: composition and viewing distance, lens character and focal length, aperture and depth of field, film or digital medium, then the specific camera body. Treat the body as the implementation of an already-defined visual result, never as a standalone style label.

If film is selected, keep the camera body compatible with the format and stock: use a film camera for physical capture, or a digital body with print-film emulation for a digital pipeline. Never combine a digital body with wording such as `captured on Kodak Vision3`; never use a print stock as a capture negative.

Before choosing a body, assess the scene scale and camera position, daylight or low-light conditions, required dynamic range and highlight behavior, static or moving capture, normal or high frame rate, VFX and reframing needs, period or medium character, and compatibility among body, format, lens system, focal length, and recording medium. For a conceptual AI scene without real production metadata, present the camera as a plausible generation recommendation, not the verified camera used by a referenced work.

Choose exactly one body whose operational strengths match the scene:

- `ARRI ALEXA 65`: epic landscapes, monumental architecture, desert horizons, premium dimensionality.
- `ARRI ALEXA Mini LF`: grounded narrative environments, practical sets, interiors, human-scale realism.
- `ARRI ALEXA 35`: controlled digital narrative work requiring high dynamic range, natural highlight rolloff, and readable shadow detail without a large-format look.
- `Sony VENICE 2`: low-light or mixed-light environments, clean full-frame dimensionality, restrained noise, and natural color separation.
- `RED V-RAPTOR XL 8K`: VFX-heavy action, vehicles, creatures, destruction, or heavy reframing.
- `ARRICAM ST/LT` or `Panavision Panaflex Millennium XL2`: controlled 35mm narrative photography, practical sets, period texture, or sync-sound production; allow subtle film grain only when the brief supports it.
- `ARRIFLEX 435`: high-speed photography, effects plates, motion-control, or non-sync capture; do not use it as a generic choice for an ordinary dialogue or quiet narrative scene merely because a film look is requested.
- `ARRIFLEX 416` or `ARRIFLEX SR3`: an explicitly requested 16mm documentary, tactile, or visibly grain-led environment.
- `IMAX 15/70 film camera`: exceptionally monumental spectacle only.

Keep body, format, lens system, focal length, aperture, exposure, depth of field, filtration, and grain/noise policy mutually consistent. Add ISO and shutter only when they control a visible low-light or motion result. Confirm that the named lens system actually supports the selected focal length; when uncertain, use a common verified focal length rather than inventing a specification. Typical guidance: 24mm for wide geography/interiors, 35mm for natural cinematic environments, 50mm for neutral perspective, 85mm for compressed focal subjects, 200mm for distant layers; f/5.6–f/11 for readable environments and f/2.8 for a subject-led scene.

### Value map

Every prompt must include `Value map:` immediately after `Lighting:`. Use 3–5 ordered neutral-gray swatches, never colored swatches, for example:

`V1 #121212, near-black: deepest foreground shadow; V2 #3D3D3D, dark: structural shadow mass; V3 #777777, middle gray: dominant environment; V4 #BDBDBD, light: lit planes; V5 #F0F0F0, near-white: restrained focal highlight.`

Assign the swatches to foreground, middle ground, background, focal subject, silhouette separation, and highlight ceiling. Keep the focal point at the strongest contrast and preserve readable shadow detail unless the user requests crushed blacks.

### Revision lock

After a prompt is delivered, treat it as locked. On revision, change only the requested dimension: composition/framing, space/layout, subject/story, lighting/atmosphere, color/grade, value structure, materials/realism, or exclusions. Preserve all unmentioned camera, crop, object placement, depth layers, lighting direction, colors, value codes, and negative constraints. For removal, delete only the named element; do not fill the space or rebalance the composition. Return the complete prompt again, not a diff.

## Multi-shot and triptych adaptation

Apply this only when the user requests multiple connected frames, a sequence, storyboard-like scene prompts, or a triptych. Read `references/cinematic-pressure-and-anti-ai.md` and `references/cinematic-example-matrix.md` first.

- Generate each frame as an independent prompt; do not ask the image model to draw a collage or contact sheet.
- Preserve one world, capture substrate, film format/stock/print chain when applicable, color thesis, material logic, and continuity state across the set unless the brief motivates a change.
- Give each frame a different relationship pressure, audience position, visual-traffic path, shot scale, or information function. Do not create three versions of the same composition.
- Make the sequence order meaningful. A valid set changes access, knowledge, distance, action, relationship, or consequence; it must weaken when shuffled.
- Use no more than one motivated special-lens or special-light insert in a three-frame set. Keep the other frames optically stable.
- When a stitched triptych is requested, specify separate frame generation and external assembly. Follow the user's layout; if none is given, use equal visual weight without inventing a specific aspect ratio.
- Score both each frame and the sequence relationship. Any frame below 82, or a sequence that remains readable when shuffled, requires a complete set rewrite before delivery.

## Final Output Structure

Use this exact top-level structure. Reference-image prompts use `Color palette:`. Text-only prompts use `Cinematic color tone:` plus `Photography / grading parameters:`. Do not add generic quality-supplement sections.

```text
PROMPT:
[English overview: style, subject, space/view, camera, composition, and focal hierarchy]

Foreground:
[foreground occlusion, scale, materials, and details]

Middle ground:
[focal point, action, paths, and relationships]

Background:
[distant geography, architecture, weather, atmosphere, and depth]

Lighting:
[time, key light, ambient light, haze, contrast, exposure]

Value map:
[3–5 numbered neutral-gray swatches with exact #RRGGBB codes and their placement]

Color palette:
[Only for a user reference image: dominant, material, accent, shadow, and light colors]

Cinematic color tone:
[Only for text-only prompts: direct color/light/contrast language; include at most one quoted source with attribution only when user-approved]

Photography / grading parameters:
[Only for text-only prompts: concise, scene-relevant camera and grading controls with visible consequences; include one physical-film or digital-emulation chain only when applicable]

PHOTOGRAPHIC TONE:
[Only physical realism or requested rendering language, material response, atmosphere, and image texture not already stated elsewhere]

Avoid:
[3-6 brief exclusions limited to user constraints and the most likely scene-specific drift]
```

Do not include empty conditional sections: use either `Color palette:` or the two text-only sections. Do not output meta-instruction labels, positive/negative boilerplate sections, or a separate run-check list. Keep the final prompt entirely English and end at the `Avoid:` section.

## Desert and worldbuilding defaults

Use these only when the brief supports them. Establish one macro geography: cliff base/canyon wall, open dunes, plateau, or oasis. Organize a settlement with tiers, rows, rings, lanes, courtyard, or periphery only when a settlement is requested. Add only functional details stated by the user or required to explain the named location; do not automatically inject tents, fires, markets, vehicles, beasts, relic machinery, or crowds. Never mix cliff settlement and open-dune camp unless requested. For aerial desert scenes, make altitude and readable layout explicit; add tiny human scale only when people are requested or needed to communicate scale.

## Training And Validation

Use the files under `training/` only when improving or validating this skill. They are not needed for normal scene generation.

## Quality gate

Before delivery, silently verify:

- indoor/outdoor and view type are explicit and camera language agrees;
- relationship state, spatial pressure, audience position, and visual traffic are mutually consistent when the scene contains narrative subjects or a dominant subject-environment relationship;
- the composition has one dominant task and one unambiguous primary focal anchor;
- subject placement follows gaze, movement, routes, architecture, and intended tension; directional space and negative space have a clear function;
- shot scale, camera height, angle, crop, depth order, and occlusion preserve the essential action or spatial information;
- the eye reaches the primary anchor first and follows a readable second path before camera and lens choices are finalized;
- foreground, middle ground, background, focal hierarchy, scale, and spatial logic are readable;
- visible architecture and interiors pass the selected reality-regime check: structural support, enclosure, circulation, room adjacency, scale, access, egress, period/typology, and any speculative enabling rule are coherent;
- lighting, value map, palette/source tone, exposure, lens, and materials do not contradict;
- the color thesis has a dominant body, supporting range, restrained accent, physical sources, and a narrative or perceptual purpose; it does not fall back to generic blue-gray or teal-orange treatment without cause;
- one camera body is used consistently;
- any film choice uses one compatible capture stock and at most one optional print-film emulation; format, camera body, dominant light, sensitivity, grain scale, exposure, and texture policy agree;
- digital capture is never falsely described as physical capture on a film negative, and a print stock is never treated as a capture stock;
- the camera body is named exactly once and is not repeated as decorative authority in later sections;
- the camera body follows from scale, light, movement, frame-rate, VFX, medium, and lens-compatibility requirements instead of functioning as a generic cinema-look label;
- reference mode obeys original-rewrite or 1:1 rules;
- every visible detail is traceable to the user brief, a user-approved reference, or a necessary physical/spatial inference;
- a named visual source appears only when user-approved, appears at most once, and contributes no subject, prop, geography, composition, or story content;
- text-only grading parameters contain only scene-relevant controls with visible consequences and do not conflict with the requested texture;
- no fixed positive or negative supplement has been appended;
- repeated facts, decorative synonym chains, generic quality language, and irrelevant technical metadata have been removed;
- detail density is selective: one primary clue or anchor, at most two supporting clues, and enough ordinary, soft, dark, occluded, or empty space for the frame to feel captured rather than illustrated;
- imperfections, grain, diffusion, reflections, dirt, moisture, smoke, lens effects, and special lighting are selective and physically justified rather than globally stacked;
- `Avoid:` contains only 3-6 scene-specific failure modes and does not introduce unrelated concepts;
- `Avoid:` includes `black-and-white or monochrome image` for every color or color-unspecified request, and omits it only when the user explicitly requests a colorless result;
- no Chinese characters appear in the delivered prompt;
- the final output follows the fixed structure and ends at `Avoid:`.

### Silent 100-point scoring gate

Score the complete draft privately before delivery:

- Relationship/spatial pressure, audience position, and visual traffic: 20.
- Composition, focal hierarchy, depth, negative space, and spatial readability: 20.
- Lighting, value map, color thesis, and physical color sources: 20.
- Physical realism, selective detail, anti-AI texture discipline, and material credibility: 15.
- Camera, lens, capture medium, film stock/print chain when applicable, exposure, and optical consistency: 10.
- User-constraint traceability, originality/reference safety, and prompt hygiene: 10.
- Exact output structure, English-only delivery, and targeted `Avoid:` list: 5.

Treat unexplained special effects, glossy AI rendering, generic game/concept-art drift in a realistic brief, copied reference composition, unreadable focal hierarchy, contradictory camera/light logic, impossible or arbitrary architectural combinations outside an explicitly surreal brief, incoherent interior circulation or room adjacency, impossible film-camera-stock pairing, digital capture falsely described as physical negative capture, or untraceable invented content as veto failures regardless of the numeric score.

If the score is below 82 or any veto fails, rebuild the complete prompt once and rescore. If it still cannot pass because the brief is materially contradictory or missing a decision that changes the result, ask one concise blocking question instead of delivering a weak prompt. Never show the score, checklist, failed draft, or rewrite note to the user.
