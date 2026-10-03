# Design

## Ownership semantics

The UI shows every validated owner returned by Steam Families' available-lender list, including the current user. It does not claim to show every friend who owns the game, nor identify the selected copy. Duplicate accounts collapse to one avatar; the current user sorts first, followed by account ID. For sharing-excluded games such as CS2, an empty successful list can show only the current user when native permanent-license proof passes.

Unknown ownership and non-Steam entries display nothing. Missing persona data does not erase a proven owner: display an initial if a name exists, otherwise a silhouette. Failed images use the same fallback. A changed image URL remounts the image state so an earlier failure does not poison a new URL.

## Capsule layout

Default corner is bottom-left, inset 2px from both edges. Default avatar diameter is 28px including a 2px white circular border. Gap is 4px. Bottom corners use `column-reverse`: the first/current owner stays at the bottom and subsequent owners grow upward. Top corners use `column`. Right corners align on the right edge. Every reported owner is retained; no horizontal row or count replacement.

Settings offer enable/disable, 20/28/36px sizes, four corners and refresh. Version-two settings migrate old size/enabled preferences and adopt bottom-left. Storage failures fall back to session settings.

Each avatar has an accessible “Owned by …” label; unknown names use “Owned by a Steam Family member.” Images are decorative inside that labelled element. The stack has no tabindex, click listener, pointer handling or gamepad handling. Native capsule focus, navigation and activation remain native.

The latest upward layout was measured on the real Deck: three avatars in Golf With Your Friends and two in Little Nightmares share x coordinates and grow by 32px vertically. User approved the appearance. Exhaustive physical-controller, offline and other-channel testing is still pending.
