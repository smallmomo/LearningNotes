# 焚决航拍场景提示词模板

Use this reference only for a matching desert, dune, canyon, tribal settlement, encampment, sand-skiff, mechanical-beast, or aerial-layout brief. If the brief is merely outdoors or arid but does not request these motifs, return to the main skill and do not import this reference's content.

## Minimal User Input

Accept short inputs like:

```text
场景：崖壁部落 / 开阔沙丘营地 / 机械兽市场 / 沙艇船坞 / 沙漠祭坛
地形：峡谷、崖壁、开阔沙丘、盐湖、绿洲、废墟
核心物：遗迹熔炉、中央大帐、瞭望塔、沙艇群、机械兽栏
氛围：黄金时刻、尘雾、热浪、真实航拍、电影感
特殊要求：更破败/更繁忙/更隐蔽/更宏大
```

If the user gives only one phrase, infer only the macro geography, readable layout, one focal landmark, and physically necessary scale cues. Do not automatically add every prop or worldbuilding motif in this reference.

## Output Shape

Return:

1. A complete English scene prompt only; do not add a Chinese scene interpretation or a run-check list.
2. `Color palette:` only when the user provides a reference image; otherwise use `Cinematic color tone:` followed by concise `Photography / grading parameters:`.
3. Name at most one visual source only when the user supplied or approved it; otherwise describe the color treatment directly.
4. A targeted `Avoid:` list with 3-6 likely failures.
5. End at `Avoid:`.

## Universal Skeleton

```text
PROMPT:
A photorealistic top-down aerial bird's-eye view photograph of [scene subject], cinematic composition with the user-specified aspect ratio only when provided, captured on [one selected cinema camera body]. [Macro geography sentence.]

[Settlement layout: how the structures are organized from the air.]

[Architecture and materials: stone, tents, hide, wool, bronze, wood, bone, fabric, dust.]

[Central landmark / key worldbuilding object.]

[Vehicles, beasts, salvage, trade, craft, or ritual stations.]

[Signs of life: tiny human figures, fires, smoke, fabrics, racks, riders, workers.]

Lighting: [user-specified or physically motivated time, key direction, shadow length, ambient fill, atmospheric dust or heat shimmer only when supported by the brief].

[If a reference image is provided]
Color palette: [exact palette extracted from the reference image, with material/color roles and optional hex values.]

[If no reference image is provided]
Cinematic color tone: [describe saturation discipline, warm/cool separation, shadow temperature, highlight behavior, atmospheric color, material response, and contrast; name one quoted source with attribution only when user-approved, and never borrow its visible content or composition.]

Photography / grading parameters: Lens / focal length: [scene-appropriate compatible lens]. Aperture and depth of field: [environment-readable setting]. White balance / color temperature: [scene-motivated value]. Exposure, contrast, and highlight rolloff: [visible tonal behavior]. Diffusion / filtration: [only when visibly needed]. Grain / noise policy: [match the requested medium and atmosphere]. Add color space, LUT, ISO, or shutter only when the user requests a grading recipe or the scene visibly depends on them. Do not repeat the camera body already named in `PROMPT:`.

PHOTOGRAPHIC TONE: [state only the requested photographic or rendering behavior, physical materials, atmosphere, lens perspective, highlight response, and medium texture; do not force Kodak response, skip-bleach processing, pristine sharpness, grain, or noise unless supported by the brief.]

Avoid: [3-6 user-specified or likely scene-specific failures only.]
```

## Template A: Cliff Settlement

Use when the brief mentions hidden settlement, cliff, canyon, cave dwellings, base camp, fortress, relic forge, or vertical sandstone architecture.

```text
A photorealistic top-down aerial bird's-eye view photograph of a hidden desert tribal settlement carved into the base of a massive weathered sandstone cliff, wide cinematic composition. The settlement sits at the foot of a curving canyon wall in the open desert, with multi-tier honeycomb stone structures cut directly into the cliff face, dozens of cave-dwelling openings stacked in irregular vertical rows, weathered sand-colored stone facades pockmarked with arched doorways and small wind-cooled openings, narrow stepped pathways zigzagging up the cliff connecting the levels.

At the base of the cliff, a central open courtyard of packed sand spreads outward into the desert. Weathered leather-and-textile nomadic tents are pitched in clusters, conical and hardened with metallic fiber thread reinforcement, dyed in deep burgundy and dust-cream tones. Small wooden trading stalls with hanging fabric awnings line the courtyard edges.

At the center of the courtyard stands [central relic object], an ancient bronze mechanical installation about three meters tall, weathered green-bronze patina, embedded copper coils, exposed gears, thin black smoke rising from it. This is the tribe's salvage-forge / relic heart where they repair mechanical limbs, weapons, and sand-skiff parts.

Scattered across the courtyard are parked sand-skiff vessels, low-slung wind-powered desert craft with mechanical legs folded under, covered in dust and aged leather wraps. A few sand-grazing mechanical beasts, sand-antelope-like creatures with bronze armor plating, are tethered near a trough at the cliff base.

Signs of life: tiny human figures moving about the courtyard, small cooking fires with thin smoke rising at tent clusters, hanging carpets and dyed fabrics drying on cliff-face lines, drying racks of cured meat, traders and mechanics around the forge.
```

## Template B: Open Dune Encampment

Use when the brief mentions nomadic camp, open dunes, tent village, mobile tribe, patrol camp, seasonal gathering, market, or no cliff.

```text
A photorealistic top-down aerial bird's-eye view photograph of a sprawling nomadic desert encampment in the open dunes, wide cinematic composition. The encampment spreads across low rolling sand dunes with no surrounding canyon or cliff, exposed to open sky on all sides, a self-contained tribal village made entirely of tents and improvised structures.

The encampment is organized in concentric loose rings: at the center a large ceremonial circular tent the size of a small house, its frame visible through hanging fabric, dyed in deep burgundy and ochre with patterned trim and a smoke vent in the roof. Around it are ring upon ring of smaller dome-shaped yurt-style tents made of layered hide and woven wool in dust-cream and weathered burgundy tones, roughly forty tents staggered outward. Between tent rings, narrow sandy lanes wind through the village with low wooden pole fences and hanging dyed fabrics.

Scattered across the village: cooking fire clusters with thin columns of smoke, racks of drying meat strips, open-air ironworking stations where ancient bronze-mechanical limbs and prosthetics are hammered on anvils with sparks visible, animal pens holding sand-grazing mechanical beasts mixed with ordinary desert goats, and parked sand-skiff vessels at the village periphery with mast-rigging visible.

On one edge rises a tall wooden watchtower made of weathered timber and dried bone, with a cinnabar red banner snapping in the wind. On the opposite edge, a salvage pile of disassembled mechanical limbs and bronze parts catches the light.

Signs of life: dozens of tiny human figures moving through sandy lanes, a group gathered around the central ceremonial tent, riders on mechanical beasts approaching from one dune edge, children running between smaller tents.
```

## Color Treatment

Use `Color palette:` only when the user provides a reference image. Do not output `Color palette:` for text-only scene requests.

When a reference image is provided, derive the palette from it:

- Dominant environment colors: walls, terrain, sky, water, snow, vegetation, floor, buildings.
- Material colors: wood, stone, metal, fabric, glass, smoke, dust, fur, concrete.
- Accent colors: banners, candles, neon, magic light, clothing focal point, warning lights.
- Shadow/light colors: cool window light, warm candlelight, golden hour, aurora glow, misty blue-grey.
- Overall discipline: low saturation, dusty warmth, cold winter palette, humid green-grey interior, post-apocalyptic desaturation, etc.

When only text is provided, use `Cinematic color tone:` instead. Describe the color grade directly: controlled saturation, warm/cool separation, restrained highlight color, shadow temperature, atmospheric color, material behavior, and contrast discipline. Name at most one visual source only when the user supplied or approved it, and use it only for color, lighting, contrast, atmosphere, and material response. Directly after it, add concise `Photography / grading parameters:` containing only controls with visible consequences.

```text
Cinematic color tone: low saturation and dusty warmth, amber sandstone highlights, cool gray-brown cliff shadows, restrained oxidized-metal accents, soft atmospheric falloff, and moderate contrast. If the user approved a named source, add it once and use it only as a color, light, and contrast anchor.

Photography / grading parameters: compatible 35mm-equivalent aerial lens, f/5.6-f/8 depth for layout readability, daylight white balance with warm sand bounce, protected highlights, restrained midtone contrast, soft bright-sand rolloff, filtration and grain/noise policy matched to the requested medium. Add color space, LUT, ISO, or shutter only when requested or visibly necessary; do not repeat the camera body.
```

Default cliff settlement:

```text
faded sandstone amber #C4A176, dust-cream tent canvas #DDC9A0, deep oxidized bronze #6B5A38, burgundy textile accents #7A2F2C, cinnabar red banner accents #A82A2A as the sole saturated focal color, cliff shadow cool grey #6B5A47, sand floor pale gold #D4B896, late golden hour warmth #F4E6C8.
```

Default open encampment:

```text
faded burgundy tent fabric #7A2F2C, dust-cream wool felt #DDC9A0, weathered leather brown #4A332A, dust-filmed white tent panels #EAE2D0, ochre rope and wood #A89472, smoke wisp pale gray #B4A98F, cinnabar red banner accent #A82A2A, sand floor pale gold #D4B896, late golden hour warmth #F4E6C8, deep tent shadows #6B5A47.
```

## Slot Rules

- **Scene subject**: specify one clear location type, not a vague mood.
- **Top-down aerial view**: always include altitude language and tiny-human scale.
- **Macro geography**: cliff/canyon/open dunes must be explicit; do not mix cliff settlement and open camp unless asked.
- **Organization**: describe rings, rows, tiers, lanes, courtyard, periphery, or edge landmarks.
- **Functional landmarks**: include one central anchor such as relic forge, ceremonial tent, sand-skiff dock, market, ritual altar, watchtower, salvage yard.
- **Worldbuilding props**: include only the subset explicitly requested or necessary to explain the named function. Never inject the complete sand-skiff, mechanical-beast, bronze-part, tent, fire, smoke, and drying-rack bundle by default.
- **Life signs**: add figures or work activity only when requested or necessary for scale; otherwise allow an intentionally empty environment.
- **Color treatment**: use `Color palette:` only when a reference image is provided. For text-only prompts, use `Cinematic color tone:` with direct color language; name at most one user-approved source and immediately add concise, visibly relevant `Photography / grading parameters:`. Do not force a default desert palette when the user specifies another color direction.
- **Prompt hygiene**: every prop, activity, material, color, and technical setting must be traceable to the brief, an approved reference, or a necessary spatial/physical inference. Do not append fixed quality supplements.
- **Photographic tone**: describe only scene-relevant aerial photography or rendering behavior. Do not force 35mm film, skip-bleach processing, pristine sharpness, grain, or noise.
- **Camera body**: choose exactly one cinema camera body from the Cinema Camera Selection Rules. Use ARRI ALEXA 65 for premium large-format epic scale or skin/highlight priority; ARRI ALEXA Mini LF / ALEXA LF for grounded narrative realism and practical environments; RED V-RAPTOR XL 8K for VFX, high-detail action, creatures, vehicles, or heavy reframing; ARRI ALEXA 35 or a compatible Panavision 35mm film camera for analog period or tactile documentary character; IMAX 15/70 film camera only for truly monumental spectacle. Name the body once in `PROMPT:` and do not repeat it in later sections.

## Internal Verification

1. Use a user-specified aspect ratio only when one is provided; otherwise keep the composition cinematic and readable.
2. The selected view follows the user's brief; use top-down or bird's-eye only when aerial information is required.
3. Macro terrain is clear without combining incompatible cliff, canyon, dune, plateau, or oasis geographies.
4. Settlement organization is readable only when a settlement is requested.
5. A central landmark exists only when the brief needs one.
6. Worldbuilding props and life signs are limited to requested or necessary details.
7. Lighting follows the requested or physically implied time rather than a fixed golden-hour preset.
8. Color treatment follows the user's requested palette or a direct scene-motivated palette; a named source appears only when user-approved and does not add content.
9. Photography and grading parameters contain only controls with visible consequences.
10. No fixed quality supplement or long negative vocabulary dump appears.
11. `Avoid:` contains only 3-6 failures relevant to this desert scene.
