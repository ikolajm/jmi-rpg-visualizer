# Party Wipe — Data & Licensing

## Data Source

5e SRD content from the official API (https://www.dnd5eapi.co/). Already downloaded, already being typed. CC-BY-4.0 — free to use, modify, distribute with attribution.

## Homebrew Mixing

SRD and homebrew content share identical type shapes. Tag with `source: 'srd' | 'homebrew'` so the engine treats them uniformly but they're separable if needed.

Homebrew is Jacob's original content — no licensing concerns. Can be mixed freely alongside SRD data in the same repo and data files.

## Distribution

Not a commercial product. At most: private hosted instance with WebSocket multiplayer for friends (v2). This is the digital equivalent of a kitchen-table D&D game using free rules + homebrew. No licensing issues.

## Attribution

Include somewhere visible (about page, README):

```
This game uses content from the Systems Reference Document 5.1 
("SRD 5.1") by Wizards of the Coast LLC. The SRD 5.1 is licensed 
under the Creative Commons Attribution 4.0 International License 
(CC-BY-4.0).
```

## Repo Size

Full SRD subset for v1 (monsters CR 1/4-10, spells levels 0-5, equipment, 6 classes) is ~1-3MB of JSON. Non-issue for a game repo. JSON files committed directly — no database needed for v1.
