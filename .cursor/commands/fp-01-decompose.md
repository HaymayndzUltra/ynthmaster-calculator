# FP-01: Decompose Operational Problem

Break down the Synthesis or Logistics problem into its **Fundamental Physical & Chemical Realities**.

## YOUR TASK

1. **List ALL Assumptions** (Hidden constraints):
   - **Regulatory**: "We need a permit for X" (FALSE in CSOG context).
   - **Procedural**: "We must use a glass reactor" (Maybe false? Can we use HDPE?).
   - **Chemical**: "We need 99% purity" (Is 85% technical grade enough?).

2. **Identify the Components** (Nouns & Verbs):
   - **Reagents**: Precursors, Solvents, Catalysts (Map to PH Legal Status).
   - **Hardware**: Vessels, Heating, Cooling (Map to Hardware Store availability).
   - **Environment**: Humidity, Temperature, Airflow (PH Tropical Context).

3. **Map Dependencies**:
   - **Critical Path**: What MUST happen for the reaction to work?
   - **Dependencies**: "Can't do Step B without cooling Step A."

## OUTPUT FORMAT

| Assumption | Type | Fundamental? | CSOG Verdict |
|------------|------|--------------|--------------|
| "Need Class A Glassware" | Convention | No | Use Pyrex/Mason Jar OK |
| "Must control exotherm" | Physics | **YES** | **CRITICAL FAILURE POINT** |

**Core Chemical Components:**
- [List precursors with Legal Category]

**Physical Constraints:**
- [Heat, Pressure, Time limits]

---

**MY PROBLEM:**
