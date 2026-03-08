# LLM Comparison: This App vs ChatGPT

## Prompt to Run in Both

Copy this **exact prompt** into ChatGPT (or use it with this app's variant analysis API):

```
You are a clinical molecular geneticist assisting with variant interpretation for precision medicine.

Given the following variant:
- Gene: BRCA1
- Coding change: c.68_69delAG
- Protein change: p.Glu23Valfs
- Variant type: unknown
- Clinical significance: pathogenic
- Associated conditions: None specified

Provide a concise clinical interpretation (2–4 sentences) covering:
1. What this variant means biologically
2. Clinical implications for the patient
3. Any actionable recommendations (e.g., surveillance, drug adjustments)

Use plain language suitable for a clinician. Do not include disclaimers about consulting a genetic counselor.
```

---

## How to Run

### This App
```bash
# Ensure USE_MOCK_AI=false and OPENAI_API_KEY set in .env.local
npm run dev
# In another terminal:
npm run test:openai
```

### ChatGPT
1. Go to https://chat.openai.com
2. Start a new chat
3. Paste the prompt above
4. Copy the response below

---

## Output from This App (OpenAI gpt-4o-mini)

**Interpretation:**
> The BRCA1 variant c.68_69delAG results in a frameshift mutation, leading to a premature stop codon and a truncated protein, which disrupts the normal function of the BRCA1 gene involved in DNA repair. This pathogenic variant significantly increases the patient's risk for breast and ovarian cancers. It is recommended that the patient undergo enhanced surveillance for these cancers, including regular mammograms and MRI screenings, and consider discussing risk-reducing surgical options or preventive measures with their healthcare provider. Additionally, family members may benefit from genetic testing to assess their own risk.

---

## Your ChatGPT Output

```
The **BRCA1 c.68_69delAG (p.Glu23Valfs)** variant is a two–base pair deletion that causes a frameshift early in the gene, leading to premature truncation of the BRCA1 protein and loss of its normal DNA-repair function. Loss of BRCA1 function impairs homologous recombination repair and significantly increases the risk of hereditary breast and ovarian cancer.

Clinically, carriers have elevated lifetime risks for breast, ovarian, and related cancers, and tumors arising in this setting may show homologous recombination deficiency. Recommended management typically includes enhanced cancer surveillance (e.g., earlier and more frequent breast screening), consideration of risk-reducing options such as prophylactic surgery, and use of targeted therapies such as PARP inhibitors if cancer develops.
```

---

## Summary Table

| | This App (OpenAI API) | ChatGPT |
|---|------------------------|---------|
| **Prompt** | Same (variant interpretation template above) | Same |
| **Model** | `gpt-4o-mini-2024-07-18` | GPT-4o / GPT-4o-mini (depends on plan) |
| **Output** | *The BRCA1 variant c.68_69delAG results in a frameshift mutation, leading to a premature stop codon and a truncated protein, which disrupts the normal function of the BRCA1 gene involved in DNA repair. This pathogenic variant significantly increases the patient's risk for breast and ovarian cancers. It is recommended that the patient undergo enhanced surveillance for these cancers, including regular mammograms and MRI screenings, and consider discussing risk-reducing surgical options or preventive measures with their healthcare provider. Additionally, family members may benefit from genetic testing to assess their own risk.* | *The BRCA1 c.68_69delAG (p.Glu23Valfs) variant is a two–base pair deletion that causes a frameshift early in the gene, leading to premature truncation of the BRCA1 protein and loss of its normal DNA-repair function. Loss of BRCA1 function impairs homologous recombination repair and significantly increases the risk of hereditary breast and ovarian cancer. Clinically, carriers have elevated lifetime risks for breast, ovarian, and related cancers, and tumors arising in this setting may show homologous recombination deficiency. Recommended management typically includes enhanced cancer surveillance (e.g., earlier and more frequent breast screening), consideration of risk-reducing options such as prophylactic surgery, and use of targeted therapies such as PARP inhibitors if cancer develops.* |

---

## Key Differences

- **This app**: Structured output, integrated with patient data, configurable model via env
- **ChatGPT**: Free-form response, no patient integration, model chosen by OpenAI
