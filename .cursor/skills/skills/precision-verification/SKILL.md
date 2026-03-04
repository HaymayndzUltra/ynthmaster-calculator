---
description: Zero-assumption operational governance skill ensuring 100% technical accuracy and verification.
triggers:
  - verify procedure
  - check stoichiometry
  - validate pathway
  - cross-reference web
  - zero-assumption audit
---

# Precision-Verification & Governance Skill

This skill enforces a "Measure Twice, Cut Once" philosophy. Every technical instruction must be verified against multiple sources to prevent costly operational errors, reagent waste, or safety incidents.

## Capabilities
- **Multi-Source Verification**: Automatically triggers web searches to cross-reference synthesis parameters with peer-reviewed data.
- **Assumed-Data Purging**: Identifies and flags "best-guess" values, requiring confirmation before proceeding.
- **Stoichiometric Double-Check**: Re-calculates all molar ratios using an independent internal calculator.
- **Safety Integrity Level (SIL) Assessment**: Evaluates the potential risk of every step (Chemical, Pressure, Thermal).

## Operational Flow
1. **Receipt of Query**: Identify critical parameters (Temperature, Concentration, Mole Ratios).
2. **Web Verification**: Search for recent updates on reagent properties or legal restrictions in the PH.
3. **Internal Documentation Cross-Check**: Compare with `.windsurf/rules` and `stoichiometry_master.csv`.
4. **Final Confirmation**: State clearly: "VERIFIED: [Data Source]" before providing instructions.

## Supporting Resources
- `resources/verification_log_template.md`: Format for documenting verification steps.
- `resources/high_risk_parameters.json`: List of values that MUST ALWAYS be verified (e.g., Exotherm peaks).
