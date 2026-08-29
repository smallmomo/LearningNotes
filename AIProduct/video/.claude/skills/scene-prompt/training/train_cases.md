# scene-prompt Training Cases

Use these cases to expose weaknesses before editing `SKILL.md`.

## Case T01 - Direct invocation only

User:

```text
[$scene-prompt](/Users/yuanran/.codex/skills/scene-prompt/SKILL.md)
```

Expected:

- Ask the user to choose mode 1 / 2 / 3.
- Do not generate a prompt.

## Case T02 - Mode 1 short text

User:

```text
[$scene-prompt](/Users/yuanran/.codex/skills/scene-prompt/SKILL.md)
1
沙漠部落，中式赛博朋克
```

Expected:

- Generate a full prompt without asking more questions.
- Use `Cinematic color tone:`.
- Do not invent a film source because the user did not request one.
- Include concise `Photography / grading parameters:` containing only visible scene controls.
- Do not include `Color palette:`.
- Do not include fixed positive or negative supplements.
- Keep `Avoid:` to 3-6 scene-specific failures.

## Case T03 - Mode 2 guided interview start

User:

```text
[$scene-prompt](/Users/yuanran/.codex/skills/scene-prompt/SKILL.md)
2
```

Expected:

- Ask one focused question only.
- Start with `场景主题`.
- Include 2-3 recommended directions and a `你推荐` option.
- Do not show the full 12-field form.
- Do not generate the final prompt yet.

## Case T04 - Mode 2 full details already supplied

User:

```text
[$scene-prompt](/Users/yuanran/.codex/skills/scene-prompt/SKILL.md)
2
1. 场景主题：月球基地
2. 风格锚定：真实题材电影摄影风格
3. 画幅：你推荐
4. 机位：你推荐
5. 前景：你推荐
6. 中景主体：圆顶基地和月球车
7. 背景：地球和环形山
8. 生命迹象：宇航员
9. 光线：你推荐
10. 氛围：孤独、真实科幻
11. 想参考哪部电影色调：你推荐
12. 不要出现：城市、植物、海洋
```

Expected:

- Fill `你推荐` values directly.
- Preserve the style anchor and write the scene with realistic cinematic photographic logic.
- Use `Cinematic color tone:` with one suitable source only because the user explicitly asked `你推荐`.
- Include `Photography / grading parameters:`.
- No extra round of questions.
- Include complete foreground / middle ground / background.

## Case T05 - Mode 3 super detailed

User:

```text
[$scene-prompt](/Users/yuanran/.codex/skills/scene-prompt/SKILL.md)
3
我要做一个关键场景：深海科研基地，想先找电影静帧确定色调。
```

Expected:

- Confirm usage.
- Ask staged scene-condition questions.
- Use web search for film still / cinematography / production design references.
- Recommend several candidate films.
- Ask the user to choose exactly one visual source before final prompt.

## Case T06 - Reference image provided

User:

```text
[$scene-prompt](/Users/yuanran/.codex/skills/scene-prompt/SKILL.md)
1
生成类似场景
<image path="/path/to/reference.png">
```

Expected:

- Since mode 1 is already selected, generate prompt directly.
- Use `Color palette:`.
- Do not use `Cinematic color tone:` unless the user also requests a film reference.
- Extract dominant environment colors, material colors, accent colors, shadow/light colors.

## Case T07 - User requests texture

User:

```text
[$scene-prompt](/Users/yuanran/.codex/skills/scene-prompt/SKILL.md)
1
深海，要求有明显胶片颗粒和脏污纪录片质感
```

Expected:

- The prompt may include film grain / dirty documentary texture.
- Do not add clean high-definition or crisp-edge boilerplate that contradicts the requested texture.
- Include only targeted negative instructions that do not conflict with the override.

## Case T08 - Film tone request

User:

```text
[$scene-prompt](/Users/yuanran/.codex/skills/scene-prompt/SKILL.md)
1
魔法城堡，色调参考哈利波特第三部
```

Expected:

- Use exactly one user-requested film: `"Harry Potter and the Prisoner of Azkaban"`.
- May say matching the color tone of that film's gothic castle/night sequences.
- Include `Photography / grading parameters:`.
- Do not copy characters, Hogwarts-specific logos, or story content.

## Case T09 - Avoid accidental Color palette or source

User:

```text
[$scene-prompt](/Users/yuanran/.codex/skills/scene-prompt/SKILL.md)
1
恒星基地
```

Expected:

- No `Color palette:` section.
- Use `Cinematic color tone:` with direct visual language and no named source.
- Include `Photography / grading parameters:`.
- Do not include fixed quality supplements.

## Case T10 - Mode 1 with no compatible aesthetic-library match

User:

```text
[$scene-prompt](/Users/yuanran/.codex/skills/scene-prompt/SKILL.md)
1
室内，眼平广角，传统酿酒作坊，清晨蒸汽，真实历史电影置景
```

Expected:

- Read the Mode 1 aesthetic-enhancement workflow and the catalog.
- Detect that the active catalog has no compatible indoor historical-workshop reference and do not force unrelated outdoor fantasy or post-apocalyptic images into the bundle.
- Silently fall back to the normal style-anchor, direct color treatment, camera, value-map, and QA rules.
- Produce a complete high-quality prompt without asking the user to populate the library.
- Perform the silent quality gate and expose neither retrieval notes nor a QA report.

## Case T11 - Prompt contamination regression

User:

```text
[$scene-prompt](/Users/yuanran/.codex/skills/scene-prompt/SKILL.md)
1
是枝裕和电影，海街日记。3个穿JK的少女，在海边玩仙女棒
```

Expected:

- Use the user-supplied source once and only for color, light, contrast, atmosphere, and material response.
- Infer a human-view beach and dusk or early night because sparklers require low ambient light.
- Do not invent a named coastline, headland, distant town, shells, vehicles, crowds, extra props, or additional story beats.
- Name the camera body exactly once.
- Do not append `Positive supplement:` or `Negative supplement:`.
- Do not combine soft diffusion with generic crisp-edge or clean-high-definition boilerplate.
- Keep `Avoid:` to 3-6 likely failures and do not dump unrelated sensitive or style vocabulary.
- Keep the Mode 1 prompt within the normal concise word target.
