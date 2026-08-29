# Film Stock Selection

Read this reference when the user requests film, analog texture, a named stock, print-film emulation, or a 16mm/35mm/65mm capture decision. Film is optional; do not apply this module solely because a brief asks for a cinematic image.

## Contents

1. Selection order
2. Core stock library
3. Format and camera compatibility
4. Physical film versus digital emulation
5. Prompt placement
6. Imperfection rules
7. Rejection conditions

## 1. Selection order

Use this priority:

1. Preserve an explicit user stock, format, or digital/film instruction when physically coherent.
2. Match visible evidence in a user reference without inventing a specific stock from ambiguous texture.
3. Decide physical film, digital capture with print-film emulation, or no film treatment.
4. Select the format from the required scale and texture.
5. Select daylight or tungsten balance from the dominant light source.
6. Select sensitivity from real illumination and desired grain, not from prestige.
7. Add a print-film emulation only when denser theatrical contrast has a visible purpose.

Do not award film an automatic aesthetic advantage. A clean digital pipeline is correct when it better serves the brief.

## 2. Core stock library

Use these as the compact default library:

| Stock | Use | Visible behavior |
|---|---|---|
| Kodak Vision3 50D 5203 / 7203 | strong daylight, coast, landscape, architecture, bright exteriors | very fine grain, clear color separation, natural skin, restrained contrast, clean highlight density |
| Kodak Vision3 250D 5207 / 7207 | general daylight, overcast exteriors, naturalistic drama, mixed daylight | versatile sensitivity, stable skin, gentle saturation, broad latitude, fine-to-moderate grain by format |
| Kodak Vision3 200T 5213 / 7213 | controlled interiors, twilight, warm practical light with moderate illumination | cleaner than 500T, soft warm-light separation, fine grain, controlled shadows |
| Kodak Vision3 500T 5219 / 7219 | night, weak practicals, street light, dark interiors | higher sensitivity, fuller shadow density, visible but restrained grain, natural warm/cool separation |
| Kodak Double-X 5222 / 7222 | black-and-white history, crime, social realism, documentary tension | pronounced monochrome grain, firmer contrast, textured midtones, less modern cleanliness |
| Kodak Ektachrome 100D 5294 / 7294 | bright daylight, reversal-film period character, intentionally direct color | higher contrast and saturation, narrow exposure tolerance, crisp color separation; use selectively |
| Kodak 2383-style print-film emulation | optional finishing stage for physical or digital capture | denser blacks, concentrated color, firmer theatrical contrast; never treat it as a capture negative |

Recommendation defaults when film is justified:

- naturalistic daylight, family, youth, coast, everyday drama: 35mm Vision3 250D;
- strong sun, landscape, architecture, clean daylight: 35mm Vision3 50D;
- controlled interior, twilight, warm practicals: 35mm Vision3 200T;
- night and weak practical light: 35mm Vision3 500T;
- intimate documentary or rough social observation: Super 16 version of 250D or 500T;
- monochrome historical or social tension: Double-X;
- deliberately saturated, brittle reversal color: Ektachrome 100D;
- stronger theatrical density: optional 2383-style print emulation after the capture decision.

Do not include Portra or Cinestill in the default cinema library. Portra is a still-photography negative; use it only for an explicitly photographic brief. Cinestill's removed remjet and halation signature are easily exaggerated by image models; use it only when the user explicitly requests that still-photo treatment. Treat discontinued Fuji Eterna stocks as historical emulations only when the user or approved reference calls for them.

## 3. Format and camera compatibility

- **65mm:** use only for exceptional monumental scale or unusually smooth tonal separation. Pair with a compatible 65mm camera; do not use it as a generic premium adjective.
- **35mm:** default physical narrative format. Pair with ARRICAM ST/LT, Panavision Panaflex Millennium XL2, or another user-specified compatible 35mm body.
- **Super 16:** use for deliberate softness, coarser grain, documentary immediacy, or period television texture. Pair with ARRIFLEX 416 or ARRIFLEX SR3.
- **ARRIFLEX 435:** reserve for high-speed, effects, plates, or non-sync capture; do not select it for ordinary quiet dialogue merely to obtain a film look.
- **IMAX 15/70:** reserve for exceptional spectacle that physically justifies its scale and operational burden.

Format governs apparent grain and resolution. Do not request Super 16 with completely grainless large-format cleanliness, or 65mm with coarse distressed 16mm texture unless the contradiction is explicitly intentional.

## 4. Physical film versus digital emulation

Choose one pipeline:

**Physical film capture**

```text
ARRICAM LT, 35mm capture on Kodak Vision3 250D
```

**Digital capture with print-film emulation**

```text
ARRI ALEXA Mini LF, restrained Kodak 2383-style print-film emulation
```

Never write:

```text
ARRI ALEXA Mini LF captured on Kodak Vision3 250D
```

A digital body cannot physically expose a motion-picture negative. If a digital pipeline needs a negative-stock-like response, describe the visible curve and color behavior without claiming physical capture, then optionally name one print-film emulation.

## 5. Prompt placement

Keep the color thesis and the technical film chain separate.

- `Cinematic color tone:` describe the dominant color body, support range, accent, physical sources, saturation discipline, warm/cool relation, and the visible film response. Do not repeat the stock name here.
- `Photography / grading parameters:` state the exact format, capture stock or digital pipeline, optional print emulation, lens, aperture, exposure/highlight policy, filtration, and grain policy. Keep the camera body only in the first `PROMPT:` sentence and name each stock once.
- `PHOTOGRAPHIC TONE:` describe physical realism, local softness, material response, and atmosphere that have not already been stated. Do not repeat the stock or camera.

A stock name must be accompanied by visible consequences such as highlight density, saturation response, skin behavior, contrast, grain scale, or exposure tolerance. Remove a stock name if deleting it would not change the intended image.

## 6. Imperfection rules

Film does not automatically authorize:

- light leaks;
- scratches or dust;
- date stamps or film borders;
- expired color shifts;
- heavy halation or bloom;
- chromatic fringing;
- gate weave;
- crushed blacks or universal softness.

Choose at most one dominant imperfection family and only when the brief, physical handling, transfer method, or requested period justifies it. Grain should follow format, stock sensitivity, exposure, and enlargement; do not add identical heavy grain to every film choice.

## 7. Rejection conditions

Reject and rewrite when:

- several capture stocks are stacked in one frame;
- a digital camera is described as physically captured on a negative;
- a print stock is used as the capture stock;
- daylight/tungsten balance conflicts with the dominant source without an intentional visible reason;
- the selected speed contradicts illumination or the requested grain behavior;
- format, camera body, stock, exposure, and grain are incompatible;
- film becomes generic yellow-green nostalgia, global dirt, red halation, or heavy grain unrelated to the scene;
- a named film source, stock, and LUT each impose different palettes;
- a clean 3D, illustration, animation, technical, or product task receives unrequested film defects.
