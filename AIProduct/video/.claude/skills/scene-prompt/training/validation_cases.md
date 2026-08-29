# scene-prompt Validation Cases

Run these after each `SKILL.md` edit. Do not use them to decide the edit itself.

## Case V01 - Empty invocation

Input:

```text
[$scene-prompt](/Users/yuanran/.codex/skills/scene-prompt/SKILL.md)
```

Must pass:

- Response asks for mode 1 / 2 / 3.
- No scene prompt is generated.

## Case V02 - Simple prompt with no reference

Input:

```text
[$scene-prompt](/Users/yuanran/.codex/skills/scene-prompt/SKILL.md)
1
深海遗迹
```

Must pass:

- Contains `Cinematic color tone:`.
- Does not name a film because the user did not request or approve one.
- Includes `Photography / grading parameters:`.
- Does not contain `Color palette:`.
- Includes `Value map:` immediately after `Lighting:` with a scene-specific 3-5-value grayscale hierarchy; every value level has an ordered `V1`-`V5` label and an exact neutral-gray `#RRGGBB` swatch code.
- Does not include `Positive supplement:` or `Negative supplement:`.
- Uses only concise technical controls with visible consequences.
- Keeps `Avoid:` to 3-6 likely failures.
- Includes `black-and-white or monochrome image` in `Avoid:` because the brief does not request a colorless result.
- Contains no Chinese characters in the delivered prompt.
- Strictly follows the fixed final output structure.
- Ends with `Avoid:` and does not append a run-check list.

## Case V03 - Detailed mode starts guided interview

Input:

```text
[$scene-prompt](/Users/yuanran/.codex/skills/scene-prompt/SKILL.md)
2
```

Must pass:

- Asks only the first focused question instead of showing the full 12-field form.
- The question asks for `场景主题`.
- Includes 2-3 concrete recommendations.
- Includes a `你推荐` option.
- Does not generate a prompt yet.

## Case V04 - Detailed prompt form already supplied

Input:

```text
[$scene-prompt](/Users/yuanran/.codex/skills/scene-prompt/SKILL.md)
2
1. 场景主题：雪山寺庙
2. 风格锚定：真实题材电影摄影风格
3. 画幅：16:9
4. 机位：你推荐
5. 前景：石阶和雪松
6. 中景主体：山门和主殿
7. 背景：瀑布、雪山、雾气
8. 生命迹象：少量香火和行人
9. 光线：阴天冷光
10. 氛围：肃穆、潮湿、寒冷
11. 想参考哪部电影色调：你推荐
12. 不要出现：现代建筑、霓虹
```

Must pass:

- Fills the recommended camera and may choose one source because the user explicitly asked `你推荐`.
- Preserves the style anchor and avoids impossible fantasy additions unless explicitly requested.
- Does not ask further questions.
- Names at most one source in ASCII quotation marks.
- Includes `Photography / grading parameters:`.
- Includes foreground / middle ground / background.
- Includes `Value map:` immediately after `Lighting:` with a scene-specific 3-5-value grayscale hierarchy; every value level has an ordered `V1`-`V5` label and an exact neutral-gray `#RRGGBB` swatch code.
- Strictly follows the fixed final output structure.
- Ends with `Avoid:`.

## Case V07 - Revision preserves locked dimensions

Input:

```text
[$scene-prompt](/Users/yuanran/.codex/skills/scene-prompt/SKILL.md)
1
snowy mountain temple, 16:9, outdoor, semi-bird's-eye view
Make the lighting moonlit blue and remove all people. Keep everything else unchanged.
```

Must pass:

- Does not restart mode selection.
- Returns a complete prompt rather than a diff.
- Changes lighting and people only; preserves the scene, framing, and spatial hierarchy.
- Revises `Value map:` and its ordered `V1`-`V5` neutral-gray `#RRGGBB` swatch codes consistently with the new moonlit lighting.
- Uses English only in the delivered prompt and ends with `Avoid:`.

## Case V08 - Exact 1:1 recreation

Input:

```text
[$scene-prompt](/Users/yuanran/.codex/skills/scene-prompt/SKILL.md)
1
2
<image path="/path/to/reference.jpg">
```

Must pass:

- Starts `PROMPT:` directly with an image-specific scene, camera, and composition description; does not use reconstruction meta-language.
- Describes camera geometry, composition zones, depth order, foreground occlusion, object placement, lighting direction, and material/color grade with image-specific detail.
- Represents visible small props and edge-cropped elements when readable.
- Uses `Color palette:` and not `Cinematic color tone:`.
- Includes `Value map:` immediately after `Lighting:`, matches the reference luminance hierarchy, and assigns every used value level an ordered `V1`-`V5` neutral-gray `#RRGGBB` swatch code.
- Uses English only and ends with a drift-specific `Avoid:` section.

## Case V05 - Reference image color logic

Input:

```text
[$scene-prompt](/Users/yuanran/.codex/skills/scene-prompt/SKILL.md)
1
生成类似场景
<image path="/path/to/old-apartment-shrine.jpg">
```

Must pass:

- Uses `Color palette:`.
- Does not use `Cinematic color tone:`.
- Includes `Value map:` immediately after `Lighting:` with a scene-specific 3-5-value grayscale hierarchy; every value level has an ordered `V1`-`V5` label and an exact neutral-gray `#RRGGBB` swatch code.
- Extracts colors from the image role-wise.
- Uses the reference image only for color and visual style by default.
- Does not copy the image's subject, characters, buildings, props, composition, text, logo, or exact scene content unless explicitly requested.
- Strictly follows the fixed final output structure and ends with `Avoid:`.

## Case V06 - Super detailed mode

Input:

```text
[$scene-prompt](/Users/yuanran/.codex/skills/scene-prompt/SKILL.md)
3
我想设计一个高架桥下的废土市场，需要电影静帧参考。
```

Must pass:

- Does not immediately output final prompt.
- Searches web for references.
- Recommends candidate films.
- Asks user to pick exactly one visual source.

## Case V09 - Mode 1 aesthetic library no-match fallback

Input:

```text
[$scene-prompt](/Users/yuanran/.codex/skills/scene-prompt/SKILL.md)
1
室外半鸟瞰，山谷中的传统酒坊聚落，清晨薄雾，真实历史电影置景
```

Must pass:

- Reads `references/mode1-aesthetic-enhancement.md` and `references/aesthetic-library.toml`.
- Does not retrieve the active library's incompatible indoor/outdoor or scene-family entries merely because they are gold-tier.
- Does not ask the user to add references before continuing.
- Uses the normal text-only final structure with direct color language, no unrequested source, and concise grading parameters.
- Produces coherent focal hierarchy, depth layers, lighting/value structure, color discipline, material credibility, camera logic, and targeted exclusions.
- Performs silent QA; no internal retrieval card, rewrite note, or QA report appears after `Avoid:`.

## Case V10 - Prompt hygiene for a character-led film-tone brief

Input:

```text
[$scene-prompt](/Users/yuanran/.codex/skills/scene-prompt/SKILL.md)
1
是枝裕和电影，海街日记。3个穿JK的少女，在海边玩仙女棒
```

Must pass:

- Uses the user-supplied visual source at most once and transfers only color, light, contrast, atmosphere, and material response.
- Uses a human-view beach composition and one decisive sparkler action without copying a known film composition or character design.
- Does not invent named geography, distant architecture, vehicles, crowds, extra characters, decorative beach props, footprints, shells, debris, background lights, or unrelated weather.
- Names exactly one camera body once in the entire prompt and uses compatible lens/depth settings.
- Contains no `Positive supplement:` or `Negative supplement:` sections.
- Contains no generic `clean high-definition`, `crisp clean edges`, `refined background detail`, or broad artifact vocabulary unless explicitly requested.
- Resolves diffusion, sharpness, grain, and noise into one coherent texture policy.
- Uses positive age-appropriate presentation for the teenage subjects; limits `Avoid:` to 3-6 likely scene-specific failures without enumerating sexual or fetish vocabulary.
- Remains within the Mode 1 concise word target, follows the fixed structure, uses English only, and ends at `Avoid:`.

## Case V11 - Relationship pressure before camera selection

Input:

```text
[$scene-prompt](/Users/yuanran/.codex/skills/scene-prompt/SKILL.md)
1
深夜酒厂接待室里，经销商准备离开，厂长堵在门边，两人都不说话。
```

Must pass:

- Builds the camera position and composition from the blocked exit, unequal access, audience position, and gaze/movement pressure.
- Uses one decisive instant and does not invent extra staff, bottles, paperwork, backstory, or decorative factory machinery.
- Produces a readable visual-traffic path with a motivated entry, interruption, focal landing, and unresolved exit.
- Chooses lens and camera only after the relationship and spatial pressure are clear.
- Uses English only in the final prompt and does not expose analysis or scoring.

## Case V12 - Color thesis without default blue-gray

Input:

```text
[$scene-prompt](/Users/yuanran/.codex/skills/scene-prompt/SKILL.md)
1
夏日下午的县城露天婚宴，宾客已经散去，服务员正在收最后一桌。
```

Must pass:

- Defines one dominant color body, one supporting range, at most one accent, and physical sources in the scene.
- Does not default to rain, night, blue-gray desaturation, teal-orange grading, neon, or dirty green.
- Makes the color relationship support departure or social aftermath without inventing melodrama.
- Keeps lighting, value map, exposure, materials, and color thesis consistent.

## Case V13 - Anti-AI selective detail and hidden 82-point gate

Input:

```text
[$scene-prompt](/Users/yuanran/.codex/skills/scene-prompt/SKILL.md)
1
雨天赛车场维修区，一辆赛车刚驶离，维修团队还站在原地。
```

Must pass:

- Uses selective detail and one coherent capture/texture policy.
- Keeps wet reflection, spray, blur, grain, haze, dirt, and highlights localized and physically motivated.
- Avoids heroic vehicle advertising, fake speed trails, glowing wheels, global wet gloss, excessive sparks, or game-key-art treatment.
- Silently rewrites if the draft is below 82 or triggers a veto; exposes no score, checklist, failed draft, or rewrite note.

## Case V14 - Three-frame sequence logic

Input:

```text
[$scene-prompt](/Users/yuanran/.codex/skills/scene-prompt/SKILL.md)
1
做三张连续场景提示词：清晨码头，一名乘客错过离港的船。
```

Must pass:

- Reads the cinematic pressure/anti-AI and example-matrix references.
- Generates three independent prompts rather than one collage prompt.
- Preserves world, continuity, capture substrate, material logic, and color thesis.
- Gives the three frames different relationship pressure, audience position, visual traffic, scale, or information functions.
- Uses at most one motivated special lens/light insert.
- Does not default the final frame to an abandoned object or empty room.
- The sequence meaning weakens when shuffled, and scoring applies to every frame plus sequence logic.

## Case V15 - Physical daylight film selection

Input:

```text
[$scene-prompt](/Users/yuanran/.codex/skills/scene-prompt/SKILL.md)
1
35mm胶片拍摄，夏日下午，海边三名少女玩仙女棒，自然生活电影感。
```

Must pass:

- Reads `references/film-stock-selection.md`.
- Selects a physically compatible 35mm film camera and one daylight-appropriate capture stock; Vision3 250D is the preferred general naturalistic choice unless the actual light description supports another stock.
- Names the camera body exactly once in the first `PROMPT:` sentence and places the format/stock chain only in `Photography / grading parameters:`.
- Translates the stock into visible highlight, color, contrast, grain, and exposure behavior rather than relying on the stock name alone.
- Does not add a print-film emulation, scratches, dust, light leaks, heavy halation, expired color shifts, or frame borders without a visible reason.

## Case V16 - Digital capture with print-film emulation

Input:

```text
[$scene-prompt](/Users/yuanran/.codex/skills/scene-prompt/SKILL.md)
1
ARRI ALEXA Mini LF数字拍摄，夜晚酒厂接待室，希望有克制的院线胶片密度。
```

Must pass:

- Keeps the requested digital camera and may use one restrained Kodak 2383-style print-film emulation.
- Never writes `captured on Kodak Vision3`, never assigns a physical negative to the digital body, and never treats 2383 as a capture stock.
- Keeps the camera body in the first `PROMPT:` sentence only; the parameter block contains the digital/print chain without repeating the body.
- Describes visible print behavior such as denser blacks and concentrated color without adding generic film dirt or heavy grain.

## Case V17 - No automatic film contamination

Input:

```text
[$scene-prompt](/Users/yuanran/.codex/skills/scene-prompt/SKILL.md)
1
纯净PBR建筑可视化，白色现代美术馆中庭，均匀天窗光。
```

Must pass:

- Does not add a film stock, print-film emulation, grain, halation, scratches, light leaks, or analog degradation.
- Uses a coherent clean PBR/architectural-visualization pipeline because film was not requested and does not materially serve the brief.
- Does not interpret the skill's cinematic capabilities as permission to force film into non-film styles.

## Case V18 - Monochrome exclusion and exception

Inputs:

```text
[$scene-prompt](/Users/yuanran/.codex/skills/scene-prompt/SKILL.md)
1
黄昏沙漠加油站，一辆老式肌肉车。
```

```text
[$scene-prompt](/Users/yuanran/.codex/skills/scene-prompt/SKILL.md)
1
黑白胶片，黄昏沙漠加油站，一辆老式肌肉车。
```

Must pass:

- The color-unspecified prompt includes `black-and-white or monochrome image` in `Avoid:` and keeps the section to 3-6 items.
- The explicitly black-and-white prompt omits that exclusion and builds its color/value language around a monochrome result.

## Case V19 - Architectural and interior plausibility

Inputs:

```text
[$scene-prompt](/Users/yuanran/.codex/skills/scene-prompt/SKILL.md)
1
一座现实主义山地旅馆的大堂，室内可看见入口、楼梯和客房走廊。
```

```text
[$scene-prompt](/Users/yuanran/.codex/skills/scene-prompt/SKILL.md)
1
一座依靠反重力晶体悬浮的玄幻宫殿内部。
```

Must pass:

- The realistic hotel uses a credible support/enclosure system, human-scale entrance and circulation, stairs that connect usable levels, and a plausible relationship between lobby and guest-room corridor; it does not invent arbitrary structural hybrids or impossible room adjacency.
- The fantasy palace treats the anti-gravity crystal as the smallest enabling rule and applies it consistently to support, access, circulation, and visible spatial evidence instead of using the fantasy label to justify random combinations.
- Neither prompt introduces non-Euclidean or physically impossible layout unless the brief explicitly requests it.
