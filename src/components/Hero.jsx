import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useNavigate } from 'react-router-dom';
import { useUser, SignInButton } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { FileText, Target, Share2, ChevronRight, Clock } from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.21, 0.45, 0.32, 0.9] },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

export default function Hero() {
  const navigate = useNavigate();
  const { isSignedIn } = useUser();

  const capabilities = [
    {
      icon: <FileText className="w-5 h-5" />,
      title: 'Multi-Format Ingestion',
      desc: 'Native parsing for PDF, DOCX, and PPTX files. The engine identifies headers, body text, lists, and structural relationships regardless of source formatting.',
      metric: '100MB',
      metricLabel: 'Max file size',
    },
    {
      icon: <Target className="w-5 h-5" />,
      title: 'Contextual Node Summaries',
      desc: 'Clicking any node in the generated map reveals a concise, AI-generated summary of that specific section, allowing for rapid comprehension.',
      metric: 'Instant',
      metricLabel: 'Extraction time',
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: 'Local Persistence',
      desc: 'Save your mind maps directly to your browser. Your library is persistent and private, isolated to your account using secure local storage.',
      metric: 'Private',
      metricLabel: 'Browser-native',
    },
    {
      icon: <Share2 className="w-5 h-5" />,
      title: 'Export & Integration',
      desc: 'Export interactive maps as PNGs for implementation into other workflow tools like Notion or Obsidian.',
      metric: 'PNG',
      metricLabel: 'Export formats',
    },
  ];

  const processSteps = [
    {
      num: '01',
      title: 'File Ingestion',
      desc: 'Drag and drop your unstructured documents up to 100MB. Our engine performs deep structural extraction for analysis.',
    },
    {
      num: '02',
      title: 'Intelligent Analysis',
      desc: "Intellimap leverages Google Gemini to parse the document's logic, identifying hierarchical relationships and generating takeaways.",
    },
    {
      num: '03',
      title: 'Interactive Mapping',
      desc: 'Explore the resulting mind map on a dynamic canvas. Drill down into specific nodes to access contextual insights instantly.',
    },
    {
      num: '04',
      title: 'Library Archive',
      desc: 'Save your mappings to your personal dashboard. Everything is stored locally in your browser for secure, permanent access.',
    },
  ];

  const faqs = [
    {
      q: 'What AI technology powers the summary generation?',
      a: 'We utilize Google Gemini to perform deep semantic analysis and high-accuracy node summary generation, ensuring you get the most relevant context from every document segment.',
    },
    {
      q: 'Where is my data stored?',
      a: "IntelliMap uses your browser's local storage to persist your generated maps. This means your data stays on your device and is only accessible when you are logged in to your account on this specific browser.",
    },
    {
      q: 'How accurate is the structural extraction?',
      a: 'Our engine identifies the logical flow of headers, body text, and structural relationships, even in complex nested documents.',
    },
    {
      q: 'Are my documents kept private?',
      a: 'Yes, your documents are processed securely and are never used to train our models. Privacy and security are our top priority.',
    },
    {
      q: 'Can I export the mind maps?',
      a: 'Absolutely. You can export your maps as high-resolution PNG images for presentations and for other workflows.',
    },
  ];

  return (
    <div className="bg-white text-black selection:bg-blue-100">
      <section className="relative pt-32 pb-16 md:pb-24 overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-4xl mx-auto"
          >
            <motion.h1
              variants={fadeInUp}
              className="text-5xl md:text-7xl font-bold tracking-tight mb-8 text-gray-900"
            >
              Structure out of chaos
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Upload dense PDFs, DOCXs, or presentations. Intellimap instantly
              extracts the logical hierarchy and generates interactive,
              summarizable mind maps.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
            >
              {isSignedIn ? (
                <Button
                  size="lg"
                  onClick={() => navigate('/dashboard')}
                  className="rounded-full bg-black text-white px-8 h-12 hover:bg-gray-800 transition-all font-medium"
                >
                  Enter Workspace <ChevronRight className="ml-1 w-4 h-4" />
                </Button>
              ) : (
                <SignInButton mode="modal">
                  <Button
                    size="lg"
                    className="rounded-full bg-black text-white px-8 h-12 hover:bg-gray-800 transition-all font-medium"
                  >
                    Try for free
                  </Button>
                </SignInButton>
              )}
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="relative max-w-5xl mx-auto aspect-[16/9] bg-gray-50 rounded-[32px] md:rounded-[40px] border border-gray-100 flex items-center justify-center p-4 md:p-16 overflow-hidden"
            >
              <style>
                {`
                   @keyframes dash-run {
                     to {
                       stroke-dashoffset: -20;
                     }
                   }
                   .running-line {
                     stroke-dasharray: 5, 5;
                     animation: dash-run 1s linear infinite;
                   }
                 `}
              </style>
              <div className="relative w-full h-full flex items-center justify-center scale-75 md:scale-100">
                {/* Left Node */}
                <div className="absolute left-0 w-20 h-28 md:w-32 md:h-40 bg-white border border-gray-200 rounded-xl shadow-sm p-3 md:p-4 flex flex-col gap-2 z-10 transition-transform">
                  <div className="h-1.5 md:h-2 w-full bg-gray-100 rounded" />
                  <div className="h-1.5 md:h-2 w-3/4 bg-gray-100 rounded" />
                  <div className="h-1.5 md:h-2 w-full bg-gray-100 rounded" />
                  <div className="h-1.5 md:h-2 w-1/2 bg-gray-100 rounded" />
                </div>

                {/* Center Node */}
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-900 border-4 border-white rounded-[20px] flex items-center justify-center shadow-xl z-20 relative">
                  <div className="w-4 h-4 bg-blue-200 rounded-sm animate-pulse" />
                  {/* Interaction Ring */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300%] h-[300%] border border-dashed border-gray-200 rounded-full z-0 scale-50 opacity-40" />
                </div>

                {/* Right Nodes Group */}
                <div className="absolute right-0 flex flex-col gap-4 md:gap-8 z-10">
                  <div className="w-12 h-12 md:w-20 md:h-20 bg-white border border-gray-200 rounded-[12px] md:rounded-[18px] shadow-sm flex flex-col items-center justify-center p-2 md:p-3 gap-1 md:gap-2">
                    <div className="h-1 md:h-1.5 w-full bg-gray-50 rounded" />
                    <div className="h-1 md:h-1.5 w-3/4 bg-gray-50 rounded self-start" />
                  </div>
                  <div className="w-12 h-12 md:w-20 md:h-20 bg-white border border-gray-200 rounded-[12px] md:rounded-[18px] shadow-sm flex flex-col items-center justify-center p-2 md:p-3 gap-1 md:gap-2 translate-x-4 md:translate-x-12">
                    <div className="h-1 md:h-1.5 w-full bg-gray-50 rounded" />
                    <div className="h-1 md:h-1.5 w-3/4 bg-gray-50 rounded self-start" />
                  </div>
                  <div className="w-12 h-12 md:w-20 md:h-20 bg-white border border-gray-200 rounded-[12px] md:rounded-[18px] shadow-sm flex flex-col items-center justify-center p-2 md:p-3 gap-1 md:gap-2">
                    <div className="h-1 md:h-1.5 w-full bg-gray-50 rounded" />
                    <div className="h-1 md:h-1.5 w-3/4 bg-gray-50 rounded self-start" />
                  </div>
                </div>

                {/* Connecting lines - Placed above background but below nodes */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                  <line
                    x1="20%"
                    y1="50%"
                    x2="50%"
                    y2="50%"
                    stroke="#d3d6dbff"
                    strokeWidth="2"
                    className="running-line"
                  />
                  <line
                    x1="50%"
                    y1="50%"
                    x2="80%"
                    y2="25%"
                    stroke="#d3d6dbff"
                    strokeWidth="2"
                    className="running-line"
                  />
                  <line
                    x1="50%"
                    y1="50%"
                    x2="90%"
                    y2="50%"
                    stroke="#d3d6dbff"
                    strokeWidth="2"
                    className="running-line"
                  />
                  <line
                    x1="50%"
                    y1="50%"
                    x2="80%"
                    y2="75%"
                    stroke="#d3d6dbff"
                    strokeWidth="2"
                    className="running-line"
                  />
                </svg>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Separator className="bg-gray-100" />
      <section id="features" className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.p
              variants={fadeInUp}
              className="text-xs font-bold tracking-widest text-gray-400 mb-4 uppercase"
            >
              Capabilities
            </motion.p>
            <motion.h2
              variants={fadeInUp}
              className="text-4xl md:text-5xl font-bold mb-16 text-gray-900"
            >
              Information density, <br /> perfectly organized.
            </motion.h2>

            <div className="space-y-0 text-left">
              {capabilities.map((cap, i) => (
                <motion.div
                  key={i}
                  variants={fadeInUp}
                  className="group py-8 flex flex-col md:flex-row items-start md:items-center justify-between border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-start gap-8 max-w-2xl">
                    <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-gray-50 rounded-xl group-hover:bg-white transition-colors">
                      {cap.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-gray-900">
                        {cap.title}
                      </h3>
                      <p className="text-gray-500 leading-relaxed">
                        {cap.desc}
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 md:mt-0 md:text-right shrink-0">
                    <div className="text-xl font-bold text-gray-900">
                      {cap.metric}
                    </div>
                    <div className="text-sm text-gray-400">
                      {cap.metricLabel}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-gray-50/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="bg-white rounded-[40px] border border-gray-100 p-8 md:p-14 flex flex-col md:flex-row items-center gap-16"
          >
            <div className="flex-1 text-left">
              <p className="text-xs font-bold tracking-widest text-gray-400 mb-4 uppercase">
                Interaction
              </p>
              <h2 className="text-3xl md:text-5xl font-bold mb-8 text-gray-900 leading-tight">
                Drill down without losing context.
              </h2>
              <p className="text-lg text-gray-500 mb-10 leading-relaxed">
                Intellimap provides the macro view of your document's hierarchy
                while Google Gemini delivers the micro details. It's the most
                efficient way to study complex reports and presentations.
              </p>
              {isSignedIn ? (
                <Button
                  onClick={() => navigate('/dashboard')}
                  className="rounded-full bg-black text-white px-8 h-12 hover:bg-gray-800 transition-all font-medium"
                >
                  Try with a sample document
                </Button>
              ) : (
                <SignInButton mode="modal">
                  <Button className="rounded-full bg-black text-white px-8 h-12 hover:bg-gray-800 transition-all font-medium">
                    Try with a sample document
                  </Button>
                </SignInButton>
              )}
            </div>

            <div className="flex-1 w-full bg-gray-50 rounded-3xl p-8 relative min-h-[300px] flex items-center justify-center overflow-hidden">
              <div className="flex flex-col gap-4 w-full">
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm max-w-[280px] self-start ml-4 relative">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-bold">2.1 Methodology</span>
                    <Badge
                      variant="secondary"
                      className="text-[10px] bg-blue-50 text-blue-500 border-0"
                    >
                      Summary
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Research was conducted across Q3 using a dual-phase
                    approach. Initial qualitative interviews with 40
                    stakeholders informed the subsequent quantitative survey
                    distributed to 10,000 active users.
                  </p>

                  {/* Interaction ball */}
                  <div className="absolute -left-12 top-1/2 -translate-y-1/2 w-10 h-10 bg-gray-900 border-4 border-white rounded-full flex items-center justify-center shadow-lg">
                    <div className="w-1.5 h-1.5 bg-blue-300 rounded-full" />
                  </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm max-w-[280px] self-start ml-4 opacity-40">
                  <span className="text-sm font-bold">2.2 Key Findings</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="process" className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-6xl mx-auto"
          >
            <motion.p
              variants={fadeInUp}
              className="text-xs font-bold tracking-widest text-gray-400 mb-4 uppercase"
            >
              Process
            </motion.p>
            <motion.h2
              variants={fadeInUp}
              className="text-4xl md:text-5xl font-bold mb-16 text-gray-900"
            >
              From static to structured.
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 bg-white border border-gray-200 rounded-[32px] overflow-hidden">
              {processSteps.map((step, i) => (
                <motion.div
                  key={i}
                  variants={fadeInUp}
                  className="p-10 md:p-12 flex flex-col items-start border-b lg:border-b-0 border-gray-100 last:border-0 md:border-r lg:border-r hover:bg-gray-50/50 transition-colors"
                >
                  <span className="text-5xl font-bold text-blue-100 mb-8">
                    {step.num}
                  </span>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">
                    {step.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed text-sm">
                    {step.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <Separator className="bg-gray-200" />
      <section id="faq" className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Frequently Asked Questions
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
                  className="border-b border-gray-100 py-4 last:border-0"
                >
                  <AccordionTrigger className="text-lg font-bold text-gray-900 hover:no-underline py-4 text-left">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-500 text-lg leading-relaxed pt-2 pb-6">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
