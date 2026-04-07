/**
 * Central map of every subcategory ID → its image asset.
 * Used by SubCategoryProductsScreen so images don't need to
 * be serialised through navigation params.
 */
export const CATEGORY_IMAGE_MAP: Record<string, any> = {
  // ── Men – Casual ──────────────────────────────────────
  cat_casual_shirts:    require('../../assets/images/men/casual/shirts.jpg'),
  cat_casual_jeans:     require('../../assets/images/men/casual/jeans.jpg'),
  cat_casual_tshirts:   require('../../assets/images/men/casual/tshirts.jpg'),
  cat_casual_trousers:  require('../../assets/images/men/casual/trousers.jpg'),
  cat_casual_shorts:    require('../../assets/images/men/casual/shorts.jpg'),
  cat_casual_trackpants:require('../../assets/images/men/casual/trackpants.jpg'),
  cat_casual_jackets:   require('../../assets/images/men/casual/jackets.jpg'),
  cat_casual_sweater:   require('../../assets/images/men/casual/sweater.jpg'),

  // ── Men – Work ────────────────────────────────────────
  cat_work_shirts:      require('../../assets/images/men/work/formal-shirts.jpg'),
  cat_work_blazers:     require('../../assets/images/men/work/blazers.jpg'),
  cat_work_trousers:    require('../../assets/images/men/work/formal-trousers.jpg'),
  cat_work_ties:        require('../../assets/images/men/work/ties.jpg'),
  cat_work_shoes:       require('../../assets/images/men/work/formal-shoes.jpg'),

  // ── Men – Sports ──────────────────────────────────────
  cat_sports_tshirts:   require('../../assets/images/men/sports/sports-tshirts.jpg'),
  cat_sports_trackpants:require('../../assets/images/men/sports/track-pants.jpg'),
  cat_sports_jackets:   require('../../assets/images/men/sports/s-jackets.jpg'),
  cat_sports_shorts:    require('../../assets/images/men/sports/s-shorts.jpg'),
  cat_sports_tracksuits:require('../../assets/images/men/sports/s-tracksuits.jpg'),

  // ── Women – Western ───────────────────────────────────
  cat_women_dresses:    require('../../assets/images/categories/women/dresses.jpg'),
  cat_women_tops:       require('../../assets/images/categories/women/tops_new.jpg'),
  cat_women_jeans:      require('../../assets/images/categories/women/jeans.jpg'),
  cat_women_trousers:   require('../../assets/images/categories/women/trousers.jpg'),
  cat_women_tshirts:    require('../../assets/images/categories/women/tshirts.jpg'),
  cat_women_shirts:     require('../../assets/images/categories/women/shirts.jpg'),

  // ── Women – Ethnic ────────────────────────────────────
  cat_women_anarkali:   require('../../assets/images/categories/women/anarkali.jpg'),
  cat_women_sarees:     require('../../assets/images/categories/women/sarees.jpg'),
  cat_women_lehenga:    require('../../assets/images/categories/women/lehenga.jpg'),
  cat_women_kurtas:     require('../../assets/images/categories/women/kurtas_new.jpg'),

  // ── Women – Sports ────────────────────────────────────
  cat_women_sports_tshirt:    require('../../assets/images/categories/women/sports_tshirt.jpg'),
  cat_women_sports_sweatshirt:require('../../assets/images/categories/women/sports_sweatshirt.jpg'),
  cat_women_sports_trackpants:require('../../assets/images/categories/women/sports_trackpants.jpg'),
  cat_women_sports_shorts:    require('../../assets/images/categories/women/sports_shorts.jpg'),
  cat_women_sports_jackets:   require('../../assets/images/categories/women/sports_jackets.jpg'),

  // ── Kids – Girls ──────────────────────────────────────
  cat_kids_girls_dresses:       require('../../assets/images/categories/kids/dresses.jpg'),
  cat_kids_girls_tops:          require('../../assets/images/categories/kids/tops_tshirts.jpg'),
  cat_kids_girls_clothing_sets: require('../../assets/images/categories/kids/clothing_sets.jpg'),
  cat_kids_girls_shorts_skirts: require('../../assets/images/categories/kids/shorts_skirts.jpg'),
  cat_kids_girls_jeans:         require('../../assets/images/categories/kids/jeans.jpg'),
  cat_kids_girls_footwear:      require('../../assets/images/categories/kids/footwear.jpg'),

  // ── Kids – Boys ───────────────────────────────────────
  cat_kids_boys_tshirts:        require('../../assets/images/categories/kids/boys_tshirts.jpg'),
  cat_kids_boys_clothing_sets:  require('../../assets/images/categories/kids/boys_clothing_sets.jpg'),
  cat_kids_boys_jeans:          require('../../assets/images/categories/kids/boys_jeans.jpg'),
  cat_kids_boys_shirts:         require('../../assets/images/categories/kids/boys_shirts.jpg'),
  cat_kids_boys_footwear:       require('../../assets/images/categories/kids/boys_footwear.jpg'),

  // ── Footwear – Women ──────────────────────────────────
  cat_footwear_women_heels:    require('../../assets/images/categories/footwear/women_heels.jpg'),
  cat_footwear_women_flats:    require('../../assets/images/categories/footwear/women_flats.jpg'),
  cat_footwear_women_casual:   require('../../assets/images/categories/footwear/women_casual.jpg'),
  cat_footwear_women_boots:    require('../../assets/images/categories/footwear/women_boots.jpg'),
  cat_footwear_women_sports:   require('../../assets/images/categories/footwear/women_sports.jpg'),

  // ── Footwear – Men ────────────────────────────────────
  cat_footwear_men_casual:     require('../../assets/images/categories/footwear/men_casual.jpg'),
  cat_footwear_men_sports:     require('../../assets/images/categories/footwear/men_sports.jpg'),
  cat_footwear_men_formal:     require('../../assets/images/categories/footwear/men_formal.jpg'),
  cat_footwear_men_sandals:    require('../../assets/images/categories/footwear/men_sandals.jpg'),
  cat_footwear_men_boots:      require('../../assets/images/categories/footwear/men_boots.jpg'),

  // ── Beauty ────────────────────────────────────────────
  cat_skincare:   require('../../assets/images/categories/beauty/skincare.png'),
  cat_makeup:     require('../../assets/images/categories/beauty/makeup.png'),
  cat_haircare:   require('../../assets/images/categories/beauty/haircare.png'),
  cat_nailpolish: require('../../assets/images/categories/beauty/nailpolish.png'),
  cat_perfume:    require('../../assets/images/categories/beauty/perfume.jpg'),

  // ── Jewellery ─────────────────────────────────────────
  cat_necklaces:  require('../../assets/images/categories/jewellery/necklaces.png'),
  cat_rings:      require('../../assets/images/categories/jewellery/rings.png'),
  cat_earrings:   require('../../assets/images/categories/jewellery/earrings.jpg'),
  cat_bracelets:  require('../../assets/images/categories/jewellery/bracelets.jpg'),

  // ── Accessories ───────────────────────────────────────
  cat_handbags:   require('../../assets/images/categories/accessories/handbags.jpg'),
  cat_watches:    require('../../assets/images/categories/accessories/watches.jpg'),
  cat_belts:      require('../../assets/images/categories/accessories/belts.jpg'),
  cat_sunglasses: require('../../assets/images/categories/accessories/sunglasses.jpg'),

  // ── Legacy / generic Men's ───────────────────────────
  cat_shirts:       require('../../assets/images/categories/men/shirts.png'),
  cat_jeans:        require('../../assets/images/categories/men/jeans.jpg'),
  cat_tshirts:      require('../../assets/images/categories/men/tshirts.jpg'),
  cat_casual_shoes: require('../../assets/images/categories/men/casual-shoes.jpg'),
  cat_sweater:      require('../../assets/images/categories/men/sweater.jpg'),
  cat_sports_shoes: require('../../assets/images/categories/men/sports-shoes.jpg'),
  cat_trousers:     require('../../assets/images/categories/men/trousers.jpg'),
  cat_jackets:      require('../../assets/images/categories/men/jackets.jpg'),

  // ── Legacy / generic Women's ─────────────────────────
  cat_dresses:      require('../../assets/images/categories/women/dresses.jpg'),
  cat_tops:         require('../../assets/images/categories/women/tops.jpg'),
  cat_heels:        require('../../assets/images/categories/women/heels.jpg'),
  cat_kurtas:       require('../../assets/images/categories/women/kurtas.jpg'),
};
