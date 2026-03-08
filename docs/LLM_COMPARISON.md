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

## New Prompt (Enhanced)

The app prompt was updated to encourage more technical detail. Use this prompt for the enhanced output:

```
You are a clinical molecular geneticist assisting with variant interpretation for precision medicine.

Given the following variant:
- Gene: BRCA1
- Coding change: c.68_69delAG
- Protein change: p.Glu23Valfs
- Variant type: unknown
- Clinical significance: pathogenic
- Associated conditions: None specified

Provide a clinical interpretation covering:
1. What this variant means biologically (include mechanistic detail when relevant, e.g., homologous recombination, HRD)
2. Clinical implications for the patient
3. Any actionable recommendations (e.g., surveillance, risk-reducing surgery, PARP inhibitors, genetic counseling)

Use plain language suitable for a clinician. Include technical terms where they add clinical value. Do not include disclaimers about consulting a genetic counselor.
```

---

## Output from This App (New Prompt, OpenAI gpt-4o-mini)

**Interpretation:**
> ### Clinical Interpretation of BRCA1 Variant c.68_69delAG (p.Glu23Valfs)
>
> #### 1. Biological Significance
> The variant c.68_69delAG in the BRCA1 gene results in a deletion of two nucleotides (AG) in the coding sequence. This deletion leads to a frameshift mutation, changing the reading frame of the gene starting from codon 23, resulting in the protein change p.Glu23Valfs. The "fs" indicates that this frameshift alters the amino acid sequence downstream of the mutation, likely leading to a premature stop codon. This results in a truncated protein that is non-functional.
>
> BRCA1 is a critical gene involved in the repair of DNA double-strand breaks through a process called homologous recombination (HR). When BRCA1 is mutated, as in this case, the ability of cells to repair DNA damage is compromised, leading to genomic instability. This is a key mechanism in the development of certain cancers, particularly breast and ovarian cancers.
>
> #### 2. Clinical Implications for the Patient
> Given that this variant is classified as pathogenic, it significantly increases the patient's risk for developing breast and ovarian cancers. Women with pathogenic BRCA1 mutations have a lifetime risk of breast cancer that can exceed 80% and a lifetime risk of ovarian cancer that can be as high as 40-60%. Men with BRCA1 mutations also have an increased risk for breast cancer and may have elevated risks for other cancers, including prostate cancer.
>
> #### 3. Actionable Recommendations
> Based on the identification of this pathogenic BRCA1 variant, the following recommendations should be considered:
>
> - **Surveillance**: Enhanced screening protocols should be initiated. This includes: Annual mammograms and breast MRI starting at age 25-30; Consideration of transvaginal ultrasound and CA-125 blood tests for ovarian cancer screening, starting at age 30-35.
> - **Risk-Reducing Surgery**: The patient may consider prophylactic surgeries, such as: Bilateral mastectomy to significantly reduce breast cancer risk; Bilateral salpingo-oophorectomy (BSO) to reduce ovarian cancer risk, ideally after childbearing is complete.
> - **Pharmacological Options**: The use of PARP inhibitors (e.g., olaparib) may be considered for treatment if the patient develops breast or ovarian cancer, as these drugs exploit the DNA repair deficiency caused by BRCA mutations.
> - **Genetic Counseling**: It is important for the patient to receive genetic counseling to discuss the implications of the variant, potential familial risks, and the option for testing family members.
>
> These recommendations aim to manage the increased cancer risk associated with the BRCA1 mutation and to provide the patient with options for proactive health management.

---

## Summary Table

| | This App (Original Prompt) | This App (New Prompt) | ChatGPT |
|---|---------------------------|------------------------|---------|
| **Prompt** | Concise, 2–4 sentences | Mechanistic detail (HR, HRD, PARP inhibitors) | Original (concise) |
| **Model** | `gpt-4o-mini-2024-07-18` | `gpt-4o-mini-2024-07-18` | GPT-4o / GPT-4o-mini |
| **Output** | *The BRCA1 variant c.68_69delAG results in a frameshift mutation, leading to a premature stop codon and a truncated protein, which disrupts the normal function of the BRCA1 gene involved in DNA repair. This pathogenic variant significantly increases the patient's risk for breast and ovarian cancers. It is recommended that the patient undergo enhanced surveillance for these cancers, including regular mammograms and MRI screenings, and consider discussing risk-reducing surgical options or preventive measures with their healthcare provider. Additionally, family members may benefit from genetic testing to assess their own risk.* | *Structured sections with biological significance (frameshift, HR, genomic instability), clinical implications (lifetime risk 80% breast, 40–60% ovarian), and actionable recommendations (surveillance, mastectomy, BSO, PARP inhibitors, genetic counseling).* | *The BRCA1 c.68_69delAG (p.Glu23Valfs) variant is a two–base pair deletion that causes a frameshift early in the gene, leading to premature truncation of the BRCA1 protein and loss of its normal DNA-repair function. Loss of BRCA1 function impairs homologous recombination repair and significantly increases the risk of hereditary breast and ovarian cancer. Clinically, carriers have elevated lifetime risks for breast, ovarian, and related cancers, and tumors arising in this setting may show homologous recombination deficiency. Recommended management typically includes enhanced cancer surveillance (e.g., earlier and more frequent breast screening), consideration of risk-reducing options such as prophylactic surgery, and use of targeted therapies such as PARP inhibitors if cancer develops.* |

---

## Consistency Check

| Clinical point | This app | ChatGPT | Consistent? |
|---------------|-----------|---------|-------------|
| **Variant type** | Frameshift mutation | Two-base pair deletion causing frameshift | Yes |
| **Mechanism** | Premature stop codon, truncated protein | Premature truncation, loss of protein function | Yes |
| **Gene function** | Disrupts DNA repair | Impairs homologous recombination repair | Yes |
| **Cancer risk** | Breast and ovarian cancers | Breast, ovarian, related cancers | Yes |
| **Surveillance** | Enhanced surveillance (mammograms, MRI) | Enhanced surveillance (earlier, more frequent screening) | Yes |
| **Risk reduction** | Risk-reducing surgery discussion | Prophylactic surgery | Yes |
| **Family** | Genetic counseling for relatives | Not mentioned | Compatible |
| **Treatment** | Not mentioned | PARP inhibitors if cancer develops | Compatible |

**Summary:** Both outputs agree on the core clinical message. Neither contradicts the other. ChatGPT adds more technical detail (homologous recombination, HRD, PARP inhibitors); the app output is more concise.

---

## Key Differences

- **This app**: Structured output, integrated with patient data, configurable model via env
- **ChatGPT**: Free-form response, no patient integration, model chosen by OpenAI
- **Detail level**: ChatGPT adds more technical detail (homologous recombination, HRD, PARP inhibitors); the app output is more concise.
