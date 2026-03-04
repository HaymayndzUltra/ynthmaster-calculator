-- ============================================================
-- CSOG Calculator — SQLite Seed Data
-- Source of truth: prd-project-alpha-calculator.md (v2, post-audit)
-- All MW values from PubChem. Lead Acetate = Trihydrate (379.33).
-- ============================================================

-- ============================================================
-- TABLE: reagents (16 rows)
-- Must match opsecMapping.json exactly
-- ============================================================

CREATE TABLE IF NOT EXISTS reagents (
  id INTEGER PRIMARY KEY,
  internal_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  alias TEXT NOT NULL,
  molecular_weight REAL NOT NULL,
  density REAL,
  boiling_point REAL,
  melting_point REAL,
  notes TEXT
);

INSERT INTO reagents (internal_id, name, alias, molecular_weight, density, boiling_point, melting_point, notes) VALUES
  ('PAA',   'Phenylacetic Acid',           'Honey Crystals',   136.15, 1.09,  266.0, 77.0,  'White crystals/powder. Floral/honey odor.'),
  ('PBA',   'Lead Acetate Trihydrate',     'Sugar Lead',       379.33, 2.55,  NULL,  75.0,  'White crystals. TRIHYDRATE form (what you buy). MW 379.33, NOT anhydrous 325.29.'),
  ('HEX',   'Hexamine',                    'Camp Fuel',        140.19, 1.33,  NULL,  280.0, 'Crush Esbit tablets to powder. White solid.'),
  ('HCL',   'Muriatic Acid 32%',           'Pool Acid',         36.46, 1.16,  -85.0, NULL,  '32% HCl solution. Density 1.16 g/mL. MW is for pure HCl.'),
  ('P2P',   'Phenylacetone',               'Alpha Base',       134.18, 1.006, 214.0, -15.0, 'Clear yellow-orange oil. Floral/apple smell. BP 214°C.'),
  ('MA',    'Methylamine HCl',             'Blue Activator',    67.52, 1.47,  NULL,  227.0, 'White crystals. MP 225-230°C. Dissolve in warm water before use.'),
  ('AL',    'Aluminum Foil',               'Silver Mesh',       26.98, 2.70,  2519.0, 660.0, 'Cut 1x1cm squares, loose (not crushed). Heavy Duty preferred.'),
  ('HGC',   'Mercuric Chloride',           'Activation Salt',  271.52, 5.43,  302.0, 277.0, 'White powder. Dissolve in water for amalgamation. TOXIC.'),
  ('IPA',   'Isopropanol 99%',             'Solvent 70',        60.10, 0.786, 82.6,  -89.0, '99% grade required. 70% rubbing alcohol has too much water.'),
  ('NAOH',  'Sodium Hydroxide',            'White Flake',       40.00, 2.13,  1388.0, 323.0, '99% flakes/pearls. Corrosive. Used in Ch4 (freebase release) and Ch5 (extraction).'),
  ('TOL',   'Toluene',                     'Thinner X',         92.14, 0.867, 111.0, -95.0, 'Extraction solvent. Sweet smell. Flammable.'),
  ('NACL',  'Sodium Chloride',             'Table White',       58.44, 2.16,  1413.0, 801.0, 'Table salt. Used in HCl gas generator.'),
  ('H2SO4', 'Sulfuric Acid 98%',           'Battery Juice',     98.08, 1.84,  337.0, 10.0,  '98% conc. Drip slowly onto NaCl for HCl gas. CORROSIVE.'),
  ('ACE',   'Acetone',                     'Nail Clear',        58.08, 0.784, 56.0,  -95.0, 'Cold acetone wash removes yellow impurities. Product insoluble in cold acetone.'),
  ('MGSO4', 'Magnesium Sulfate',           'Dry Salt',         120.37, 2.66,  NULL,  1124.0, 'Anhydrous. Bake before use. Drying agent for Toluene extract.'),
  ('H2O',   'Distilled Water',             'Clean Water',       18.02, 1.00,  100.0, 0.0,   'MUST be distilled. Tap water has chlorine/minerals that kill reactions.');

-- ============================================================
-- TABLE: processes (4 rows — one per chemistry chapter)
-- Ch1 is static checklist, no process entry needed
-- ============================================================

CREATE TABLE IF NOT EXISTS processes (
  id INTEGER PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  chapter INTEGER NOT NULL,
  description TEXT,
  temp_min REAL,
  temp_max REAL,
  temp_danger REAL,
  yield_practical_max REAL,
  yield_min REAL,
  yield_max REAL,
  yield_default REAL,
  duration_min REAL,
  duration_max REAL,
  reference_input_g REAL,
  reference_output_g REAL
);

INSERT INTO processes (name, chapter, description, temp_min, temp_max, temp_danger, yield_practical_max, yield_min, yield_max, yield_default, duration_min, duration_max, reference_input_g, reference_output_g) VALUES
  ('p2p_lead_acetate',         2, 'Dry distillation of PAA + Lead Acetate Trihydrate to produce crude P2P oil.',
    200, 275, 280,   80.0, 0.50, 0.75, 0.60,   1.0, 1.5,   136.0, 80.0),
  ('methylamine_hexamine',     3, 'Hexamine hydrolysis with HCl to produce Methylamine HCl crystals.',
    80,  90,  100,   60.0, 0.50, 0.67, 0.58,   3.0, 4.0,   100.0, 60.0),
  ('reductive_amination_alhg', 4, 'Al/Hg amalgam reductive amination of P2P + Methylamine to produce freebase.',
    40,  55,  60,    30.0, 0.50, 0.83, 0.65,   4.0, 6.0,   40.0,  30.0),
  ('workup_crystallization',   5, 'Extraction, HCl gassing, and recrystallization to produce final crystal.',
    NULL, NULL, NULL, NULL, 0.10, 0.95, 0.76,   NULL, NULL,  NULL, NULL);

-- ============================================================
-- TABLE: process_reagents
-- Mass/volume ratios per 1g of baseline reagent
-- Source: PRD §3.2.2–§3.2.5
-- ============================================================

CREATE TABLE IF NOT EXISTS process_reagents (
  id INTEGER PRIMARY KEY,
  process_id INTEGER NOT NULL REFERENCES processes(id),
  reagent_id INTEGER NOT NULL REFERENCES reagents(id),
  mass_ratio REAL,
  volume_ratio REAL,
  molar_ratio REAL,
  ratio_type TEXT NOT NULL,
  is_baseline INTEGER DEFAULT 0,
  notes TEXT
);

-- Chapter 2: P2P Synthesis (baseline = PAA)
INSERT INTO process_reagents (process_id, reagent_id, mass_ratio, volume_ratio, molar_ratio, ratio_type, is_baseline, notes) VALUES
  ((SELECT id FROM processes WHERE name='p2p_lead_acetate'), (SELECT id FROM reagents WHERE internal_id='PAA'),
    1.000, NULL, 1.00, 'mass', 1, 'Baseline reagent. 136g per reference batch.'),
  ((SELECT id FROM processes WHERE name='p2p_lead_acetate'), (SELECT id FROM reagents WHERE internal_id='PBA'),
    2.390, NULL, 0.86, 'mass', 0, 'Mass ratio 2.39:1 vs PAA. Molar ratio 0.86 eq (325g/379.33 ÷ 136g/136.15).');

-- Chapter 3: Methylamine Generation (baseline = HEX)
INSERT INTO process_reagents (process_id, reagent_id, mass_ratio, volume_ratio, molar_ratio, ratio_type, is_baseline, notes) VALUES
  ((SELECT id FROM processes WHERE name='methylamine_hexamine'), (SELECT id FROM reagents WHERE internal_id='HEX'),
    1.000, NULL, 1.00, 'mass', 1, 'Baseline reagent. 100g per reference batch.'),
  ((SELECT id FROM processes WHERE name='methylamine_hexamine'), (SELECT id FROM reagents WHERE internal_id='HCL'),
    NULL, 3.000, 4.29, 'volume', 0, '300mL per 100g Hex. 3.0 mL/g volume ratio.');

-- Chapter 4: Reductive Amination (baseline = P2P)
INSERT INTO process_reagents (process_id, reagent_id, mass_ratio, volume_ratio, molar_ratio, ratio_type, is_baseline, notes) VALUES
  ((SELECT id FROM processes WHERE name='reductive_amination_alhg'), (SELECT id FROM reagents WHERE internal_id='P2P'),
    1.000, NULL, 1.00, 'mass', 1, 'Baseline reagent. 40g per reference batch.'),
  ((SELECT id FROM processes WHERE name='reductive_amination_alhg'), (SELECT id FROM reagents WHERE internal_id='MA'),
    1.000, NULL, 1.99, 'mass', 0, '40g per 40g P2P. 1:1 mass ratio. Dissolve in warm water first.'),
  ((SELECT id FROM processes WHERE name='reductive_amination_alhg'), (SELECT id FROM reagents WHERE internal_id='AL'),
    1.250, NULL, 6.22, 'mass', 0, '50g per 40g P2P. 6.22 molar eq.'),
  ((SELECT id FROM processes WHERE name='reductive_amination_alhg'), (SELECT id FROM reagents WHERE internal_id='HGC'),
    0.0125, NULL, 0.006, 'mass', 0, '0.5g per 40g P2P. Dissolve in amalgamation water.'),
  ((SELECT id FROM processes WHERE name='reductive_amination_alhg'), (SELECT id FROM reagents WHERE internal_id='IPA'),
    NULL, 2.500, NULL, 'volume', 0, '100mL per 40g P2P. Reaction solvent.'),
  ((SELECT id FROM processes WHERE name='reductive_amination_alhg'), (SELECT id FROM reagents WHERE internal_id='H2O'),
    NULL, 1.250, NULL, 'volume', 0, '50mL warm water per 40g P2P. For dissolving Methylamine HCl.'),
  ((SELECT id FROM processes WHERE name='reductive_amination_alhg'), (SELECT id FROM reagents WHERE internal_id='NAOH'),
    NULL, 0.625, NULL, 'volume', 0, '~25mL 25% NaOH per 40g P2P. Titrate to pH >12. Amount varies.');

-- Note: Ch4 also needs 200mL water for amalgamation (HgCl2 dissolving + Al rinse).
-- This is tracked as a separate process_reagent entry with a different note.
INSERT INTO process_reagents (process_id, reagent_id, mass_ratio, volume_ratio, molar_ratio, ratio_type, is_baseline, notes) VALUES
  ((SELECT id FROM processes WHERE name='reductive_amination_alhg'), (SELECT id FROM reagents WHERE internal_id='H2O'),
    NULL, 5.000, NULL, 'volume', 0, '200mL per 40g P2P. For HgCl2 solution + Al amalgamation rinse (2x wash).');

-- Chapter 5: Workup & Crystallization (reagents are mostly fixed excess, not scaled)
INSERT INTO process_reagents (process_id, reagent_id, mass_ratio, volume_ratio, molar_ratio, ratio_type, is_baseline, notes) VALUES
  ((SELECT id FROM processes WHERE name='workup_crystallization'), (SELECT id FROM reagents WHERE internal_id='NAOH'),
    NULL, 0.750, NULL, 'volume', 0, '~30mL 50% NaOH per 40g P2P input. Titrate to pH 14 for extraction.'),
  ((SELECT id FROM processes WHERE name='workup_crystallization'), (SELECT id FROM reagents WHERE internal_id='TOL'),
    NULL, 2.500, NULL, 'volume', 0, '100mL Toluene per 40g P2P input. Extraction solvent.'),
  ((SELECT id FROM processes WHERE name='workup_crystallization'), (SELECT id FROM reagents WHERE internal_id='MGSO4'),
    NULL, NULL, NULL, 'fixed_excess', 0, '~20g anhydrous MgSO4. Bake first. Drying agent — not scaled.'),
  ((SELECT id FROM processes WHERE name='workup_crystallization'), (SELECT id FROM reagents WHERE internal_id='NACL'),
    NULL, NULL, NULL, 'fixed_excess', 0, '50g NaCl for HCl gas generator. Fixed excess — not scaled.'),
  ((SELECT id FROM processes WHERE name='workup_crystallization'), (SELECT id FROM reagents WHERE internal_id='H2SO4'),
    NULL, NULL, NULL, 'fixed_excess', 0, '~30mL H2SO4 98%. Drip slowly onto NaCl. Fixed excess — not scaled.'),
  ((SELECT id FROM processes WHERE name='workup_crystallization'), (SELECT id FROM reagents WHERE internal_id='ACE'),
    NULL, NULL, NULL, 'fixed_excess', 0, '~50mL cold Acetone for final crystal wash. Fixed excess — not scaled.'),
  ((SELECT id FROM processes WHERE name='workup_crystallization'), (SELECT id FROM reagents WHERE internal_id='IPA'),
    NULL, NULL, NULL, 'fixed_excess', 0, '~2-3 mL per gram of raw crystal. Hot IPA for recrystallization. Minimum to dissolve.');

-- ============================================================
-- TABLE: procedures
-- Step-by-step with visual cues and failure modes
-- Source: CSOG Manual Chapters 2-5
-- ============================================================

CREATE TABLE IF NOT EXISTS procedures (
  id INTEGER PRIMARY KEY,
  process_id INTEGER NOT NULL REFERENCES processes(id),
  step_number INTEGER NOT NULL,
  instruction TEXT NOT NULL,
  visual_cue TEXT,
  failure_mode TEXT,
  failure_fix TEXT,
  emergency_action TEXT,
  temp_target REAL,
  temp_danger REAL,
  duration_min REAL,
  duration_max REAL,
  severity TEXT,
  pro_tip TEXT,
  image_path TEXT,
  UNIQUE(process_id, step_number)
);

-- ── Chapter 2: P2P Synthesis ──────────────────────────────────

INSERT INTO procedures (process_id, step_number, instruction, visual_cue, failure_mode, failure_fix, emergency_action, temp_target, temp_danger, duration_min, duration_max, severity, pro_tip, image_path) VALUES
  ((SELECT id FROM processes WHERE name='p2p_lead_acetate'), 1,
    'MIXING: In a stainless steel pot or Pyrex dish, mix the Phenylacetic Acid and Lead Acetate Trihydrate powders.',
    'Dry white powder mixture.',
    'Wet/clumpy mixture.',
    'Grind finer. Ensure both are completely dry before mixing.',
    NULL, NULL, NULL, NULL, NULL, 'info',
    NULL, 'procedures/ch2/step1-mixing.webp'),

  ((SELECT id FROM processes WHERE name='p2p_lead_acetate'), 2,
    'DISSOLVING: Add a small amount of distilled water — just enough to make a wet paste. This helps them mix chemically.',
    'Wet slush/paste consistency.',
    'Too much water added.',
    'Will require longer drying phase. Not fatal.',
    NULL, NULL, NULL, NULL, NULL, 'info',
    NULL, 'procedures/ch2/step2-dissolving.webp'),

  ((SELECT id FROM processes WHERE name='p2p_lead_acetate'), 3,
    'EVAPORATION: Heat the pot on stove (Low-Medium heat). Stir constantly. VENTILATION MANDATORY — vinegar fumes.',
    'Clear liquid → white pasty → solid white hard mass.',
    'Brown/black color appears.',
    'BURNED. Start over. Lower heat next time.',
    NULL, NULL, NULL, 30, 60, 'critical',
    'Stir CONSTANTLY during evaporation. Uneven heat = localized burning = black spots = start over.', 'procedures/ch2/step3-evaporation.webp'),

  ((SELECT id FROM processes WHERE name='p2p_lead_acetate'), 4,
    'BONE DRYING: Break up clumps. Keep heating gently until completely dry.',
    'Dusty white powder. No steam rising. No wet spots.',
    'Still steaming or damp spots visible.',
    'Continue heating gently. This step is critical — wet powder causes foaming in distillation.',
    NULL, NULL, NULL, 15, 30, 'critical',
    'Completely dry means COMPLETELY dry. Any moisture left = violent foaming when you distill. Test: no steam when you hold a cold glass above.', 'procedures/ch2/step4-bone-drying.webp'),

  ((SELECT id FROM processes WHERE name='p2p_lead_acetate'), 5,
    'GRINDING: Once cool, grind into fine white powder (like flour consistency).',
    'Fine, uniform white powder.',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'info',
    NULL, NULL),

  ((SELECT id FROM processes WHERE name='p2p_lead_acetate'), 6,
    'DISTILLATION SETUP: Load flask HALFWAY with powder. Connect to condenser + receiver. Use SAND BATH — never direct flame.',
    'Flask half-full with white powder. Sand bath ready.',
    'Flask cracked during setup.',
    'Sand bath ONLY. Never flame directly on glass. Check for bubbles/scratches in glass.',
    'If glass breaks during heating: DO NOT TOUCH. Open windows. Evacuate room.',
    NULL, NULL, NULL, NULL, 'emergency',
    'Fill flask only HALFWAY with powder. Overfilling causes clogging and foam-over.', 'procedures/ch2/step5-distillation-setup.webp'),

  ((SELECT id FROM processes WHERE name='p2p_lead_acetate'), 7,
    'HEATING Phase 1: Turn heat to Medium. At ~100°C, water drops appear in condenser — this is residual moisture. Discard.',
    'Condensation drops in condenser.',
    NULL, NULL, NULL, 100, NULL, 10, 15, 'info',
    NULL, NULL),

  ((SELECT id FROM processes WHERE name='p2p_lead_acetate'), 8,
    'HEATING Phase 2: At ~150°C, white powder starts to melt and bubble.',
    'Powder melting, bubbling begins.',
    'Foam rises up flask neck.',
    'REMOVE HEAT IMMEDIATELY. Let foam drain back. Resume heating slower.',
    NULL, 150, 280, 5, 10, 'critical',
    'Use Teflon tape on ALL glass joints — vapor escapes through the smallest gap.', NULL),

  ((SELECT id FROM processes WHERE name='p2p_lead_acetate'), 9,
    'HEATING Phase 3: At 200-250°C, CRITICAL ZONE. Flask fills with white/grey fog. Orange/yellow oil starts dripping into receiver.',
    'White/grey fog in flask. Orange oil dripping into receiver.',
    'No oil dripping — temp too low.',
    'Increase temperature toward 250°C. Check sand bath coverage.',
    NULL, 225, 280, 15, 30, 'warning',
    'Collect ONLY the fraction at 214°C. Everything before and after is waste or impurity.', 'procedures/ch2/step5-oil-dripping.webp'),

  ((SELECT id FROM processes WHERE name='p2p_lead_acetate'), 10,
    'COMPLETION: Continue until no more oil drips. Residue in flask is dry black/grey solid (Lead Oxide). STOP when only black solid remains.',
    'Black/grey solid in flask. No more vapor. Clear yellow-orange oil in receiver.',
    'Oil is black tar in receiver.',
    'Overheated (>280°C). Redistill the tar — collect fraction at 214°C only.',
    NULL, NULL, 280, NULL, NULL, 'critical',
    NULL, 'procedures/ch2/step5-crude-product.webp'),

  ((SELECT id FROM processes WHERE name='p2p_lead_acetate'), 11,
    'PURIFICATION: Pour crude oil into separatory funnel. Wash with 10% NaOH solution (10g Sodium Hydroxide in 100mL water). Shake 2 min. Drain bottom (waste). Keep top (oil).',
    'Oil floats on top (clear yellow). Dirty water sinks (bottom).',
    'Emulsion forms — layers won''t separate.',
    'Add more NaOH. Let settle longer. Add pinch of Sodium Chloride to break emulsion.',
    NULL, NULL, NULL, NULL, NULL, 'info',
    NULL, NULL),

  ((SELECT id FROM processes WHERE name='p2p_lead_acetate'), 12,
    'WATER WASH: Add distilled water to oil in sep funnel. Shake. Drain water. Repeat with brine (saturated salt water) to pull out moisture.',
    'Clean oil layer. Water drains clear.',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'info',
    NULL, NULL);

-- ── Chapter 3: Methylamine Generation ─────────────────────────

INSERT INTO procedures (process_id, step_number, instruction, visual_cue, failure_mode, failure_fix, emergency_action, temp_target, temp_danger, duration_min, duration_max, severity, pro_tip, image_path) VALUES
  ((SELECT id FROM processes WHERE name='methylamine_hexamine'), 1,
    'MIXING: Place crushed Hexamine in flask. Pour in Muriatic Acid slowly.',
    'Slight fizzing — normal.',
    'Violent fizzing/foaming.',
    'Add acid more slowly. Slight fizz is expected.',
    NULL, NULL, NULL, NULL, NULL, 'warning',
    'Add acid SLOWLY. Slight fizz is normal. Violent fizzing = too fast.', 'procedures/ch3/step1-hexamine-tablets.webp'),

  ((SELECT id FROM processes WHERE name='methylamine_hexamine'), 2,
    'HYDROLYSIS: Bring to gentle simmer (80-90°C). Do NOT boil violently. GAS MASK MANDATORY — Formaldehyde generated.',
    'Liquid starts clear/cloudy. White solid (Ammonium Chloride) precipitates to bottom over 3-4 hours.',
    'No white precipitate after 4 hours.',
    'Verify temp is 80-90°C. Check Hexamine purity — colored tablets may have impurities.',
    NULL, 85, 100, 180, 240, 'warning',
    'GAS MASK is non-negotiable here. Formaldehyde is invisible and causes permanent lung damage. Work outdoors or with forced ventilation.', 'procedures/ch3/step2-hydrolysis.webp'),

  ((SELECT id FROM processes WHERE name='methylamine_hexamine'), 3,
    'HOT FILTRATION: While liquid is still HOT (60-70°C), filter through coffee filter or lab paper. Methylamine HCl stays dissolved in hot liquid. Ammonium Chloride does not.',
    'White sludge stays in filter (trash). Clear yellow liquid passes through (keep!).',
    'Filtered while cold — everything crystallized together.',
    'Reheat the mixture. Re-filter while hot.',
    NULL, 65, NULL, NULL, NULL, 'critical',
    'Coffee filters work. Use 2 layers. The liquid goes through, crystals stay behind.', 'procedures/ch3/step3-hot-filtration.webp'),

  ((SELECT id FROM processes WHERE name='methylamine_hexamine'), 4,
    'EVAPORATION: Put filtered liquid in Pyrex dish. Heat gently to evaporate water/acid. Use steam bath or low electric heat — NEVER direct flame.',
    'Thick yellow/white sludge forming.',
    'Burned/charred residue.',
    'Too much heat. Use steam bath. Start over if badly burned.',
    NULL, NULL, NULL, 30, 60, 'warning',
    NULL, 'procedures/ch3/step4-evaporation.webp'),

  ((SELECT id FROM processes WHERE name='methylamine_hexamine'), 5,
    'ALCOHOL WASH: Add hot Isopropanol 99% (or Ethanol). Boil with sludge. Methylamine HCl dissolves in hot alcohol. Ammonium Chloride does NOT.',
    'Hot alcohol dissolves the good product. White residue remains (trash).',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'info',
    NULL, NULL),

  ((SELECT id FROM processes WHERE name='methylamine_hexamine'), 6,
    'FINAL FILTER: Filter the hot alcohol. Solid in filter = Ammonium Chloride (trash). Liquid = Alcohol + Pure Methylamine HCl.',
    'Clear yellow/colorless alcohol filtrate.',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'info',
    NULL, NULL),

  ((SELECT id FROM processes WHERE name='methylamine_hexamine'), 7,
    'CRYSTALLIZATION: Put alcohol liquid in freezer (-20°C) or let cool slowly. Beautiful clear/white crystals will grow. Filter and air dry.',
    'Clear/white crystals forming.',
    'Goo instead of crystals.',
    'Not dried enough. Water prevents crystallization. Heat longer (gently) before alcohol wash.',
    NULL, NULL, NULL, 240, 720, 'info',
    NULL, 'procedures/ch3/step5-crystals.webp'),

  ((SELECT id FROM processes WHERE name='methylamine_hexamine'), 8,
    'VERIFICATION: Melt test — Methylamine HCl melts at 225-230°C. Ammonium Chloride sublimes at 338°C (just smokes). Smell test — pinch + NaOH drop: fishy = good, urine = bad.',
    'Crystals melt cleanly at 225-230°C. Fishy smell with NaOH.',
    'Yellow crystals.',
    'Formaldehyde impurity. Wash with cold Acetone to whiten.',
    NULL, NULL, NULL, NULL, NULL, 'info',
    NULL, NULL);

-- ── Chapter 4: Reductive Amination ────────────────────────────

INSERT INTO procedures (process_id, step_number, instruction, visual_cue, failure_mode, failure_fix, emergency_action, temp_target, temp_danger, duration_min, duration_max, severity, pro_tip, image_path) VALUES
  ((SELECT id FROM processes WHERE name='reductive_amination_alhg'), 1,
    'PRE-FLIGHT: Prepare ice bath (bucket of ice water) RIGHT NEXT TO flask. Prepare Reagent Mix: Phenylacetone + Methylamine HCl dissolved in warm Distilled Water + Isopropanol 99%. Mix turns yellow/cloudy (Imine forming).',
    'Yellow/cloudy reagent mix in beaker. Ice bath ready.',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'info',
    'Pre-measure EVERYTHING before you start amalgamation. Once the foil is activated, you have 2 minutes. No time to weigh things.', 'procedures/ch4/step1-aluminum-squares.webp'),

  ((SELECT id FROM processes WHERE name='reductive_amination_alhg'), 2,
    'AMALGAMATION: Put Aluminum Foil squares in 2L flask. Pour Mercuric Chloride water onto foil. Ensure all foil submerged. Wait 15-30 min.',
    'Nothing for 5-10 min → tiny bubbles → water turns grey/cloudy → shiny foil turns DULL GREY and fizzy.',
    'No fizzing after 30 minutes.',
    'Amalgamation failed. Add more Mercuric Chloride. Ensure foil is fully submerged. Use fresh foil if foil has coating.',
    NULL, NULL, NULL, 15, 30, 'critical',
    'The 2-minute window is REAL. Have everything pre-measured and ready before you start.', 'procedures/ch4/step2-amalgamation.webp'),

  ((SELECT id FROM processes WHERE name='reductive_amination_alhg'), 3,
    'RINSE: Decant grey mercury water into waste. Add fresh water, swirl, pour off. Repeat once more. You now have clean, wet, ACTIVATED Aluminum Foil. ⚠️ 2-MINUTE DEADLINE before it re-oxidizes. MOVE FAST.',
    'Clean wet dull-grey foil. Slight sizzling.',
    'Took too long — foil looks shiny again.',
    'Re-oxidized. Start amalgamation again with fresh Mercuric Chloride solution.',
    NULL, NULL, NULL, 2, 3, 'critical',
    NULL, NULL),

  ((SELECT id FROM processes WHERE name='reductive_amination_alhg'), 4,
    'ADDITION: Pour Reagent Mix onto activated Aluminum Foil. Turn on magnetic stirrer (vigorous). Slowly drip 25% Sodium Hydroxide solution to release freebase.',
    'Mixture turns grey/black soup.',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'info',
    NULL, NULL),

  ((SELECT id FROM processes WHERE name='reductive_amination_alhg'), 5,
    'EXOTHERM: Within 5-10 minutes, flask gets HOT. TARGET: 40-55°C (warm to touch, can hold hand on it). Monitor continuously for 4-6 hours.',
    'Steady bubbling. Grey soup. Warm flask.',
    'Temperature >60°C — too hot to hold.',
    NULL,
    'ICE BATH IMMEDIATELY. Lift flask, dunk in ice water 30 seconds. If foam shooting up neck: ICE BATH + turn off stirrer + step back + open windows.',
    47, 60, 10, 20, 'emergency',
    'Ice bath within arm''s reach AT ALL TIMES. Not across the room. Not "nearby." ARM''S REACH.', 'procedures/ch4/step5-thermometer-safe.webp'),

  ((SELECT id FROM processes WHERE name='reductive_amination_alhg'), 6,
    'CRUISE CONTROL: Maintain 40-55°C for 4-6 hours. If boiling (>60°C): dunk in ice bath. If stalled (<30°C): add tiny bit more Sodium Hydroxide or use warm water bath.',
    'Steady warm reaction. Bubbling continues. Grey sludge thickens over hours.',
    'Reaction stalled — no heat, no bubbling.',
    'Add small amount of Sodium Hydroxide. Or use warm water bath. Aluminum may have passivated.',
    NULL, 47, 60, 240, 360, 'warning',
    '"Grey sludge thickening" is your success signal. If it stays watery, amalgamation failed.', 'procedures/ch4/step4-grey-sludge.webp'),

  ((SELECT id FROM processes WHERE name='reductive_amination_alhg'), 7,
    'COMPLETION: Aluminum foil mostly gone → thick grey sludge (Aluminum Hydroxide). No more heat produced. Fish smell (Methylamine) replaced by chemical/solvent smell.',
    'Thick grey mud. Cool flask. No more bubbling. Chemical smell (not fishy).',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'info',
    NULL, NULL);

-- ── Chapter 5: Workup & Crystallization ───────────────────────

INSERT INTO procedures (process_id, step_number, instruction, visual_cue, failure_mode, failure_fix, emergency_action, temp_target, temp_danger, duration_min, duration_max, severity, pro_tip, image_path) VALUES
  ((SELECT id FROM processes WHERE name='workup_crystallization'), 1,
    'BASIFY: Add 50% Sodium Hydroxide solution to grey sludge. Stir well. Check pH paper — MUST be pH 14 (dark purple/black). At pH 14, product turns into oil that floats.',
    'pH paper dark purple/black. Sludge becomes more liquid.',
    'Emulsion — layers won''t separate.',
    'Verify pH 14. Add more Sodium Hydroxide. Let settle longer (10+ min).',
    NULL, NULL, NULL, NULL, NULL, 'warning',
    NULL, NULL),

  ((SELECT id FROM processes WHERE name='workup_crystallization'), 2,
    'EXTRACTION: Pour in 100mL Toluene. Shake vigorously 2 minutes. Vent gas. Pour into separatory funnel. Let settle 10 min. TOP layer = Toluene + Product (KEEP). BOTTOM = waste sludge (DISCARD).',
    'Clear/yellow top layer. Grey bottom layer. Sharp separation line.',
    'Layers won''t separate cleanly.',
    'Verify pH is 14. Add more Sodium Hydroxide if needed. Let settle longer (15+ min). Add pinch of Sodium Chloride to break emulsion.',
    NULL, NULL, NULL, 15, 20, 'critical',
    'The product is in the TOP layer (toluene). The BOTTOM layer is waste. Don''t mix them up.', 'procedures/ch5/step1-separatory-funnel.webp'),

  ((SELECT id FROM processes WHERE name='workup_crystallization'), 3,
    'DRYING: Add ~20g baked Magnesium Sulfate (anhydrous) to Toluene/product mix. Let sit 10 min. Filter through coffee filter into clean dry beaker.',
    'MgSO4 clumps as it absorbs water. Clear Toluene passes through filter.',
    NULL, NULL, NULL, NULL, NULL, 10, 15, 'info',
    NULL, 'procedures/ch5/step2-drying.webp'),

  ((SELECT id FROM processes WHERE name='workup_crystallization'), 4,
    'HCl GASSING: Put 50g Sodium Chloride in bottle. Drip Sulfuric Acid 98% onto salt slowly. White HCl gas shoots out. Bubble tube into Toluene/product. White "snow" forms instantly.',
    'White snow/powder precipitating in Toluene. Continue until no more forms. pH should reach 6-7.',
    'No snow forming.',
    'Check: Is product actually in the Toluene? Verify extraction step. Try more gas.',
    NULL, NULL, NULL, 15, 30, 'critical',
    'White "snow" falling through the toluene = success. No snow = check your extraction.', 'procedures/ch5/step3-hcl-gassing-snow.webp'),

  ((SELECT id FROM processes WHERE name='workup_crystallization'), 5,
    'HARVEST: Filter Toluene through coffee filter. White powder stays in filter = RAW product. Let Toluene evaporate from powder.',
    'White powder on filter paper.',
    'Powder instead of shards.',
    'This is expected at this stage. Shards come from recrystallization (next step).',
    NULL, NULL, NULL, NULL, NULL, 'info',
    NULL, NULL),

  ((SELECT id FROM processes WHERE name='workup_crystallization'), 6,
    'RECRYSTALLIZATION: Dissolve raw powder in minimum boiling hot Isopropanol 99%. Add few drops Acetone. Cover. Cool SLOWLY to room temp, then refrigerate. DO NOT TOUCH for 12+ hours.',
    'Long, clear, needle-like shards growing over hours. Slow cooling = big crystals.',
    'Powder formed instead of shards.',
    'Cooled too fast. Redissolve in hot IPA. Cool MORE SLOWLY this time. Minimum 12 hours.',
    NULL, NULL, NULL, 720, 1440, 'info',
    'Patience is purity. 12+ hours of slow cooling = large, clean crystals. Fast cooling = powder.', 'procedures/ch5/step4-recrystallization.webp'),

  ((SELECT id FROM processes WHERE name='workup_crystallization'), 7,
    'FINAL WASH: Pour ICE COLD Acetone over crystals. Product does NOT dissolve in cold Acetone. Yellow impurities DO dissolve. Result: sparkling white crystals. Air dry.',
    'Sparkling white crystals. Clear/white. No yellow tint.',
    'Yellow crystals after wash.',
    'Wash again with more cold Acetone. Multiple washes may be needed.',
    NULL, NULL, NULL, NULL, NULL, 'info',
    NULL, NULL),

  ((SELECT id FROM processes WHERE name='workup_crystallization'), 8,
    'FINAL CHECK: Visual = Clear/White? Structure = Shards/Needles? Smell = Odorless? Melt test = 170-175°C?',
    'Clear white needle shards. Odorless. MP 170-175°C.',
    'Fishy smell remains.',
    'Needs more washing. Redissolve and recrystallize.',
    NULL, NULL, NULL, NULL, NULL, 'info',
    NULL, 'procedures/ch5/step5-final-crystals.webp');
