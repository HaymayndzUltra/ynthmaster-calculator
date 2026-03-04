import type Database from 'better-sqlite3'

interface ReagentSeed {
  internal_id: string
  name: string
  molecular_weight: number
  density: number | null
  notes: string
}

interface ProcessSeed {
  name: string
  chapter: number
  description: string
  temp_min: number | null
  temp_max: number | null
  yield_min: number | null
  yield_max: number | null
  yield_default: number | null
}

interface ProcessReagentSeed {
  process_name: string
  reagent_id: string
  molar_ratio: number | null
  ratio_type: string
  notes: string
}

const REAGENTS: ReagentSeed[] = [
  { internal_id: 'PAA', name: 'Phenylacetic Acid', molecular_weight: 136.16, density: 1.08, notes: 'Must be bone-dry powder' },
  { internal_id: 'PbAc', name: 'Lead Acetate Trihydrate', molecular_weight: 379.33, density: null, notes: '325g per 136g PAA' },
  { internal_id: 'NaOH_10', name: 'NaOH (10% wash)', molecular_weight: 40.00, density: 1.11, notes: 'Purification wash' },
  { internal_id: 'Hex', name: 'Hexamine', molecular_weight: 140.19, density: null, notes: 'Crush Esbit tablets' },
  { internal_id: 'HCl_32', name: 'HCl (32%)', molecular_weight: 36.46, density: 1.16, notes: '300mL per 100g Hex' },
  { internal_id: 'P2P', name: 'P2P (Phenylacetone)', molecular_weight: 134.18, density: 1.01, notes: 'Yellow/orange oil' },
  { internal_id: 'MeAm_HCl', name: 'Methylamine HCl', molecular_weight: 67.52, density: null, notes: 'Dissolve in 50mL warm water' },
  { internal_id: 'Al_Foil', name: 'Aluminum Foil', molecular_weight: 26.98, density: 2.70, notes: '50g per 40g P2P, 1x1cm squares' },
  { internal_id: 'Hg_Salt', name: 'Mercuric Chloride', molecular_weight: 271.52, density: null, notes: '0.5g per 40g P2P, catalytic' },
  { internal_id: 'IPA', name: 'Isopropanol', molecular_weight: 60.10, density: 0.785, notes: '100mL per 40g P2P' },
  { internal_id: 'NaOH_25', name: 'NaOH (25%)', molecular_weight: 40.00, density: 1.27, notes: 'Drip to free MeAm from HCl' },
  { internal_id: 'PSE', name: 'Pseudoephedrine', molecular_weight: 165.23, density: null, notes: 'Extracted from tablets' },
  { internal_id: 'RedP', name: 'Red Phosphorus', molecular_weight: 30.97, density: null, notes: 'Regenerates HI' },
  { internal_id: 'I2', name: 'Iodine', molecular_weight: 253.81, density: null, notes: 'Purple vapor disappears when done' },
  { internal_id: 'Toluene', name: 'Toluene', molecular_weight: 92.14, density: 0.867, notes: '100mL per 40g batch' },
  { internal_id: 'NaOH_50', name: 'NaOH (50%)', molecular_weight: 40.00, density: 1.52, notes: 'Basify to pH 14' },
  { internal_id: 'MgSO4', name: 'MgSO4 (anhydrous)', molecular_weight: 120.37, density: 2.66, notes: 'Drying agent' },
  { internal_id: 'Freebase', name: 'Freebase', molecular_weight: 149.23, density: null, notes: 'Dissolved in toluene' },
  { internal_id: 'Acetone', name: 'Acetone', molecular_weight: 58.08, density: 0.784, notes: 'Cold wash solvent' },
  { internal_id: 'NaCl', name: 'Sodium Chloride', molecular_weight: 58.44, density: null, notes: 'Table salt, excess' },
  { internal_id: 'H2SO4', name: 'Sulfuric Acid 98%', molecular_weight: 98.08, density: 1.84, notes: 'Drip onto NaCl slowly' },
  { internal_id: 'IPA_recryst', name: 'IPA or Ethanol (recryst)', molecular_weight: 60.10, density: 0.785, notes: 'Minimum to dissolve' },
  { internal_id: 'Acetone_cold', name: 'Acetone (cold wash)', molecular_weight: 58.08, density: 0.784, notes: 'Ice-cold, removes yellow' },
]

const PROCESSES: ProcessSeed[] = [
  { name: 'P2P Synthesis (Dry Distillation)', chapter: 2, description: 'Phenylacetic acid dry distillation with lead acetate', temp_min: 200, temp_max: 300, yield_min: 50, yield_max: 75, yield_default: 62.5 },
  { name: 'Methylamine Generation (Hexamine)', chapter: 3, description: 'Hexamine hydrolysis with HCl to generate methylamine HCl', temp_min: 80, temp_max: 90, yield_min: 50, yield_max: 67, yield_default: 58.5 },
  { name: 'P2P Reductive Amination', chapter: 4, description: 'Al/Hg amalgam reductive amination of P2P with methylamine', temp_min: 40, temp_max: 55, yield_min: 60, yield_max: 70, yield_default: 65 },
  { name: 'Nagai Method', chapter: 4, description: 'HI/Red phosphorus reduction of pseudoephedrine', temp_min: 100, temp_max: 120, yield_min: 60, yield_max: 80, yield_default: 70 },
  { name: 'Workup (Extraction)', chapter: 5, description: 'Toluene extraction and basification', temp_min: null, temp_max: null, yield_min: 85, yield_max: 95, yield_default: 90 },
  { name: 'HCl Gassing', chapter: 5, description: 'HCl gas crystallization of freebase', temp_min: null, temp_max: null, yield_min: 80, yield_max: 90, yield_default: 85 },
  { name: 'Recrystallization', chapter: 5, description: 'IPA/acetone recrystallization for purity', temp_min: 0, temp_max: 5, yield_min: 70, yield_max: 85, yield_default: 77.5 },
]

const PROCESS_REAGENTS: ProcessReagentSeed[] = [
  // P2P Synthesis
  { process_name: 'P2P Synthesis (Dry Distillation)', reagent_id: 'PAA', molar_ratio: 1.0, ratio_type: 'eq', notes: 'Baseline' },
  { process_name: 'P2P Synthesis (Dry Distillation)', reagent_id: 'PbAc', molar_ratio: 2.39, ratio_type: 'eq', notes: '325g per 136g PAA' },
  { process_name: 'P2P Synthesis (Dry Distillation)', reagent_id: 'NaOH_10', molar_ratio: null, ratio_type: 'wash', notes: 'Purification wash' },
  // Methylamine Generation
  { process_name: 'Methylamine Generation (Hexamine)', reagent_id: 'Hex', molar_ratio: 1.0, ratio_type: 'eq', notes: 'Baseline' },
  { process_name: 'Methylamine Generation (Hexamine)', reagent_id: 'HCl_32', molar_ratio: 3.7, ratio_type: 'vol', notes: '300mL per 100g Hex' },
  // Reductive Amination
  { process_name: 'P2P Reductive Amination', reagent_id: 'P2P', molar_ratio: 1.0, ratio_type: 'eq', notes: 'Baseline' },
  { process_name: 'P2P Reductive Amination', reagent_id: 'MeAm_HCl', molar_ratio: 2.0, ratio_type: 'eq', notes: '40g per 40g P2P' },
  { process_name: 'P2P Reductive Amination', reagent_id: 'Al_Foil', molar_ratio: 6.2, ratio_type: 'eq', notes: '50g per 40g P2P' },
  { process_name: 'P2P Reductive Amination', reagent_id: 'Hg_Salt', molar_ratio: 0.006, ratio_type: 'eq', notes: '0.5g per 40g P2P, catalytic' },
  { process_name: 'P2P Reductive Amination', reagent_id: 'IPA', molar_ratio: 2.5, ratio_type: 'vol', notes: '100mL per 40g P2P' },
  { process_name: 'P2P Reductive Amination', reagent_id: 'NaOH_25', molar_ratio: null, ratio_type: 'drip', notes: 'Drip to free MeAm from HCl' },
  // Nagai Method
  { process_name: 'Nagai Method', reagent_id: 'PSE', molar_ratio: 1.0, ratio_type: 'eq', notes: 'Baseline' },
  { process_name: 'Nagai Method', reagent_id: 'RedP', molar_ratio: 1.0, ratio_type: 'eq', notes: 'Regenerates HI' },
  { process_name: 'Nagai Method', reagent_id: 'I2', molar_ratio: 1.2, ratio_type: 'eq', notes: 'Purple vapor disappears when done' },
  // Workup
  { process_name: 'Workup (Extraction)', reagent_id: 'Toluene', molar_ratio: 2.5, ratio_type: 'vol', notes: '100mL per 40g batch' },
  { process_name: 'Workup (Extraction)', reagent_id: 'NaOH_50', molar_ratio: null, ratio_type: 'drip', notes: 'Basify to pH 14' },
  { process_name: 'Workup (Extraction)', reagent_id: 'MgSO4', molar_ratio: null, ratio_type: 'excess', notes: 'Drying agent' },
  // HCl Gassing
  { process_name: 'HCl Gassing', reagent_id: 'Freebase', molar_ratio: 1.0, ratio_type: 'eq', notes: 'Dissolved in toluene' },
  { process_name: 'HCl Gassing', reagent_id: 'Acetone', molar_ratio: 10.0, ratio_type: 'vol', notes: 'Cold wash solvent' },
  { process_name: 'HCl Gassing', reagent_id: 'NaCl', molar_ratio: 2.0, ratio_type: 'eq', notes: 'Table salt, excess' },
  { process_name: 'HCl Gassing', reagent_id: 'H2SO4', molar_ratio: 1.5, ratio_type: 'eq', notes: 'Drip onto NaCl slowly' },
  // Recrystallization
  { process_name: 'Recrystallization', reagent_id: 'IPA_recryst', molar_ratio: null, ratio_type: 'min_dissolve', notes: 'Minimum to dissolve' },
  { process_name: 'Recrystallization', reagent_id: 'Acetone_cold', molar_ratio: null, ratio_type: 'wash', notes: 'Ice-cold, removes yellow' },
]

export function seedDatabase(database: Database.Database): void {
  const reagentCount = database.prepare('SELECT COUNT(*) as count FROM reagents').get() as { count: number }
  if (reagentCount.count > 0) return

  const insertReagent = database.prepare(
    'INSERT INTO reagents (internal_id, name, molecular_weight, density, notes) VALUES (?, ?, ?, ?, ?)'
  )

  const insertProcess = database.prepare(
    'INSERT INTO processes (name, chapter, description, temp_min, temp_max, yield_min, yield_max, yield_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  )

  const insertProcessReagent = database.prepare(
    `INSERT INTO process_reagents (process_id, reagent_id, molar_ratio, ratio_type, notes)
     VALUES (
       (SELECT id FROM processes WHERE name = ?),
       (SELECT id FROM reagents WHERE internal_id = ?),
       ?, ?, ?
     )`
  )

  const seedAll = database.transaction(() => {
    for (const r of REAGENTS) {
      insertReagent.run(r.internal_id, r.name, r.molecular_weight, r.density, r.notes)
    }

    for (const p of PROCESSES) {
      insertProcess.run(p.name, p.chapter, p.description, p.temp_min, p.temp_max, p.yield_min, p.yield_max, p.yield_default)
    }

    for (const pr of PROCESS_REAGENTS) {
      insertProcessReagent.run(pr.process_name, pr.reagent_id, pr.molar_ratio, pr.ratio_type, pr.notes)
    }
  })

  seedAll()
}
