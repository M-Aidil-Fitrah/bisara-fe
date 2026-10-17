export const img = (id: string, w = 1400) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

export const IMG = {
  hero: img('photo-1758691461935-202e2ef6b69f', 2000),
  consult: img('photo-1714976694810-85add1a29c96'),
  signing: img('photo-1691929739553-3bb05b093744'),
  hands: img('photo-1655720358097-673f2a952cb7'),
  psikolog: img('photo-1573495804664-b1c0849525af', 900),
  group: img('photo-1737567425973-bf7b6369d08a', 900),
  clinic: img('photo-1714976694525-71eb29a7c500', 900),
  device: img('photo-1612832164313-ac0d7e07b5ce'),
  laptop: img('photo-1664575196044-195f135295df'),
  light: img('photo-1598312276291-6cb6c0a70cc7', 900),
  smile: img('photo-1747264464438-ff4188b1678a', 900),
}
