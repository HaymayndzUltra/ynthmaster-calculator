# Meta-Audit & Business Validation Checklist

## I. Technical Accuracy & Consistency
- [ ] Molar ratios in `stoichiometry_master.csv` match theoretical chemistry models.
- [ ] Temperature setpoints in procedures are consistent across all pathway documents.
- [ ] No contradictions between `small-scale-operations.md` and `large-scale-operations.md`.
- [ ] Reagent grades in procedures match availability in `ph_chemical_market.json`.

## II. Business & Profit Optimization
- [ ] Cost-per-gram calculation includes overhead (power, water, ice).
- [ ] Solvent recovery protocols are mandatory for batches >100g.
- [ ] Current reagent prices in `ph_chemical_market.json` are within 10% of local market rates.
- [ ] ROI analysis performed for every recommended synthesis pathway.

## III. Legal & OPSEC Compliance
- [ ] Reagent categories (A, B, C) match the latest PDEA/DENR listings.
- [ ] Odor control and waste management steps included in all procedures.
- [ ] Sourcing strategies bypass high-monitoring pharmacy SUDS systems.
- [ ] Secondary containment protocols included for hazardous material storage.

## IV. Tropical Environment Adaptation
- [ ] All gassing procedures include dehumidification steps.
- [ ] Reactor cooling capacity calculated for 35°C+ ambient temperature.
- [ ] Desiccant requirements specified for final product packaging.
