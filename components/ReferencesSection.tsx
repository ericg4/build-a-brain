import { Section } from "@/components/layout/Section";
import { Separator } from "@/components/ui/separator";

const references = [
  'Hubel, D. H., & Wiesel, T. N. (1962). Receptive fields, binocular interaction and functional architecture in the cat\u2019s visual cortex. <em>The Journal of Physiology</em>, 160(1), 106\u2013154.',
  'LeCun, Y., Bottou, L., Bengio, Y., & Haffner, P. (1998). Gradient-based learning applied to document recognition. <em>Proceedings of the IEEE</em>, 86(11), 2278\u20132324.',
  'Selvaraju, R. R., Cogswell, M., Das, A., Vedantam, R., Parikh, D., & Batra, D. (2017). Grad-CAM: Visual explanations from deep networks via gradient-based localization. <em>Proceedings of the IEEE International Conference on Computer Vision</em>, 618\u2013626.',
  'Treisman, A. M. (1964). Selective attention in man. <em>British Medical Bulletin</em>, 20(1), 12\u201316.',
  'Treisman, A. M., & Gelade, G. (1980). A feature-integration theory of attention. <em>Cognitive Psychology</em>, 12(1), 97\u2013136.',
];

export function ReferencesSection() {
  return (
    <Section id="references">
      <Separator className="mb-16" />
      <h2 className="font-heading mb-8 text-3xl font-semibold text-[var(--fg)]">
        References
      </h2>
      <ol className="space-y-4">
        {references.map((ref, i) => (
          <li
            key={i}
            className="pl-8 -indent-8 text-base leading-relaxed text-[var(--fg-muted)]"
            dangerouslySetInnerHTML={{ __html: ref }}
          />
        ))}
      </ol>
    </Section>
  );
}
