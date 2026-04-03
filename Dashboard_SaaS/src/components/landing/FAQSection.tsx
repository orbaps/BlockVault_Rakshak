import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "How does blockchain verification work?",
    a: "When a certificate is issued, we generate a SHA-256 cryptographic hash and record it on the Polygon blockchain. To verify, we re-hash the document and compare it with the on-chain record. Any modification — even a single character — produces a completely different hash.",
  },
  {
    q: "Is my actual document stored on the blockchain?",
    a: "No. Only the cryptographic hash (a fixed-length fingerprint) and metadata are stored on-chain. Your actual documents remain securely stored in our encrypted cloud storage, ensuring privacy while maintaining verifiability.",
  },
  {
    q: "Can certificates be revoked?",
    a: "Yes. Institutions can revoke certificates at any time. The revocation is recorded on the blockchain, and any future verification will show the certificate as revoked along with the revocation reason and timestamp.",
  },
  {
    q: "What types of institutions can use BlockVault?",
    a: "BlockVault is designed for schools, universities, training centers, professional certification bodies, and enterprises. Any organization that issues credentials can benefit from blockchain-backed verification.",
  },
  {
    q: "Is there a limit on the number of certificates?",
    a: "The free plan supports up to 50 certificates. Pro and Enterprise plans offer unlimited certificate issuance. Check our pricing section for full details.",
  },
  {
    q: "How do students access their credentials?",
    a: "Each student receives a unique credential passport with a permanent URL and QR code. They can share this link with employers, institutions, or anyone who needs to verify their credentials.",
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">FAQ</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Frequently asked questions
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="bg-card border border-border rounded-lg px-5"
              >
                <AccordionTrigger className="text-left text-sm font-medium text-foreground hover:no-underline py-3.5">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
