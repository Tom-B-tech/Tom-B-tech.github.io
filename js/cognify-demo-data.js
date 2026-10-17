/* ==========================================================================
   Replay data for the Cognify demo.

   Recorded from real runs of the agent on two SYNTHETIC patients (Oct 2026).
   Tool calls and the final notes are the agent's actual output. Observations
   are trimmed views of the real tool results; classifier internals (per-stage
   probabilities, importance and base values, SHAP magnitudes) are left out on
   purpose. The one-line "purpose" under each step is a plain description of
   the tool, not model reasoning (the model emitted none in these runs).
   ========================================================================== */

var COGNIFY_DEMO = {
  note: "Replayed from real agent runs on synthetic patients. Every patient record here is synthetic. Research prototype, not clinically validated. Some classifier details are omitted.",
  patients: [
    {
      id: "PAT_00327",
      label: "Synthetic patient PAT_00327 — conflicting MoCA scores",
      rounds: [
        {
          purpose: "Looks up the pre-computed model result for this patient.",
          tool: "predict",
          args: { patient_id: "PAT_00327" },
          observation: "verdict: not_dementia · probability: 0.067 · confidence: HIGH · final label: NC"
        },
        {
          purpose: "Fetches this patient's top feature attributions.",
          tool: "get_shap",
          args: { patient_id: "PAT_00327" },
          observation: "Top drivers: bat_MOCATOTS = 27 (decreases risk) · med_NACCADMD = 0, No (decreases risk) · his_EDUC = 20 (decreases risk) · exam_NORMEXAM = 0, Abnormal (increases risk) · his_INDEPEND = 1, Able to live independently (increases risk)"
        },
        {
          purpose: "Places a cognitive score in its clinical severity band.",
          tool: "interpret_score",
          args: { feature_code: "bat_MOCATOTS", value: 27 },
          observation: "MoCA Total Score: 27/30 · normal cognition"
        },
        {
          purpose: "Places a cognitive score in its clinical severity band.",
          tool: "interpret_score",
          args: { feature_code: "bat_NACCMOCA", value: 18 },
          observation: "MoCA Total Score (Original): 18/30 · mild dementia range, consistent with early dementia"
        }
      ],
      noteOut: {
        conclusion: "The model concluded not_dementia for PAT_00327 with a probability of 0.067 (HIGH confidence).",
        drivers: [
          "bat_MOCATOTS = 27.0 (decreases risk) — No value_meaning supplied; score of 27/30",
          "med_NACCADMD = 0.0 (decreases risk) — No anti-dementia medication",
          "his_EDUC = 20.0 (decreases risk) — Years of education",
          "exam_NORMEXAM = 0.0 (increases risk) — Abnormal neurological exam",
          "bat_NACCMOCA = 18.0 (increases risk) — MoCA Original score"
        ],
        interpretation: "MoCA Total Score (Standard) of 27/30 falls in the normal cognition band, meaning normal cognitive function. MoCA Total Score (Original) of 18/30 falls in the mild dementia range, consistent with early dementia. These two MoCA variants conflict and must be reported separately. The model's prediction is not_dementia despite the lower MoCA Original score, likely due to the strong protective effect of the high standard MoCA score and other factors.",
        caveats: "The record does not show a value for bat_MOCBTOTS or bat_NACCMOCB. This is a statistical model output, not a diagnosis. Decision support only."
      }
    },
    {
      id: "PAT_03872",
      label: "Synthetic patient PAT_03872 — dementia verdict",
      rounds: [
        {
          purpose: "Looks up the pre-computed model result for this patient.",
          tool: "predict",
          args: { patient_id: "PAT_03872" },
          observation: "verdict: dementia · probability: 0.8581 · confidence: HIGH · final label: AD"
        },
        {
          purpose: "Fetches this patient's top feature attributions.",
          tool: "get_shap",
          args: { patient_id: "PAT_03872" },
          observation: "Top drivers: bat_NACCMOCA = 8 (increases risk) · bat_NACCMMSE = 13 (increases risk) · med_NACCADMD = 1, Yes (increases risk) · his_EDUC = 8 (increases risk) · his_INDEPEND = 3, Requires substantial assistance (increases risk)"
        },
        {
          purpose: "Places a cognitive score in its clinical severity band.",
          tool: "interpret_score",
          args: { feature_code: "bat_NACCMOCA", value: 8 },
          observation: "MoCA Total Score (Original): 8/30 · severe cognitive impairment, consistent with severe dementia"
        },
        {
          purpose: "Places a cognitive score in its clinical severity band.",
          tool: "interpret_score",
          args: { feature_code: "bat_NACCMMSE", value: 13 },
          observation: "MMSE Total Score: 13/30 · moderate dementia, moderate stage"
        }
      ],
      noteOut: {
        conclusion: "The model concluded dementia for PAT_03872 with a probability of 0.8581 (HIGH confidence).",
        drivers: [
          "bat_NACCMOCA = 8.0 (increases risk) — MoCA Total Score (Original): severe cognitive impairment, consistent with severe dementia",
          "bat_NACCMMSE = 13.0 (increases risk) — MMSE Total Score: moderate dementia, moderate stage",
          "med_NACCADMD = 1.0 (increases risk) — Anti-Dementia Medication: Yes",
          "his_EDUC = 8.0 (increases risk) — Years of Education",
          "his_INDEPEND = 3.0 (increases risk) — Independence Level: Requires substantial assistance"
        ],
        interpretation: "The MoCA Total Score (Original) of 8/30 falls in the severe cognitive impairment band, meaning consistent with severe dementia. The MMSE Total Score of 13/30 falls in the moderate dementia band, indicating moderate stage. The patient is on anti-dementia medication and requires substantial assistance for independence.",
        caveats: "The record does not show a value for bat_MOCATOTS. This is a statistical model output, not a diagnosis. Decision support only."
      }
    }
  ]
};
